import {NodeWeakMap, SyntaxNodeRef, SyntaxNode, IterMode} from "@lezer/common"
import {Completion, CompletionContext, CompletionResult, CompletionSource} from "@codemirror/autocomplete"
import {syntaxTree} from "@codemirror/language"
import {Text} from "@codemirror/state"

const cache = new NodeWeakMap<readonly Completion[]>()

const ScopeNodes = new Set([
  "Script", "Block",
  "FunctionExpression", "FunctionDeclaration", "ArrowFunction", "MethodDeclaration",
  "ForStatement"
])

function defID(type: string) {
  return (node: SyntaxNodeRef, def: (node: SyntaxNodeRef, type: string) => void) => {
    let id = node.node.getChild("VariableDefinition")
    if (id) def(id, type)
    return true
  }
}

const functionContext = ["FunctionDeclaration"]

const gatherCompletions: {
  [node: string]: (node: SyntaxNodeRef, def: (node: SyntaxNodeRef, type: string) => void) => void | boolean
} = {
  FunctionDeclaration: defID("function"),
  ClassDeclaration: defID("class"),
  ClassExpression: () => true,
  EnumDeclaration: defID("constant"),
  TypeAliasDeclaration: defID("type"),
  NamespaceDeclaration: defID("namespace"),
  VariableDefinition(node, def) { if (!node.matchContext(functionContext)) def(node, "variable") },
  TypeDefinition(node, def) { def(node, "type") },
  __proto__: null as any
}

function getScope(doc: Text, node: SyntaxNode) {
  let cached = cache.get(node)
  if (cached) return cached

  let completions: Completion[] = [], top = true
  function def(node: SyntaxNodeRef, type: string) {
    let name = doc.sliceString(node.from, node.to)
    completions.push({label: name, type})
  }
  node.cursor(IterMode.IncludeAnonymous).iterate(node => {
    if (top) {
      top = false
    } else if (node.name) {
      let gather = gatherCompletions[node.name]
      if (gather && gather(node, def) || ScopeNodes.has(node.name)) return false
    } else if (node.to - node.from > 8192) {
      // Allow caching for bigger internal nodes
      for (let c of getScope(doc, node.node)) completions.push(c)
      return false
    }
  })
  cache.set(node, completions)
  return completions
}

const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/

export const dontComplete = [
  "TemplateString", "String", "RegExp",
  "LineComment", "BlockComment",
  "VariableDefinition", "TypeDefinition", "Label",
  "PropertyDefinition", "PropertyName",
  "PrivatePropertyDefinition", "PrivatePropertyName"
]

/// Completion source that looks up locally defined names in
/// JavaScript code.
export function localCompletionSource(context: CompletionContext): CompletionResult | null {
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1)
  if (dontComplete.indexOf(inner.name) > -1) return null
  let isWord = inner.name == "VariableName" ||
    inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to))
  if (!isWord && !context.explicit) return null
  let options: Completion[] = []
  for (let pos: SyntaxNode | null = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name)) options = options.concat(getScope(context.state.doc, pos))
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  }
}

function pathFor(read: (node: SyntaxNode) => string, member: SyntaxNode, name: string) {
  let path = []
  for (;;) {
    let obj = member.firstChild, prop
    if (obj?.name == "VariableName") {
      path.push(read(obj))
      return {path: path.reverse(), name}
    } else if (obj?.name == "MemberExpression" && (prop = obj.lastChild)?.name == "PropertyName") {
      path.push(read(prop!))
      member = obj
    } else {
      return null
    }
  }
}

/// Helper function for defining JavaScript completion sources. It
/// returns the completable name and object path for a completion
/// context, or null if no name/property completion should happen at
/// that position. For example, when completing after `a.b.c` it will
/// return `{path: ["a", "b"], name: "c"}`. When completing after `x`
/// it will return `{path: [], name: "x"}`. When not in a property or
/// name, it will return null if `context.explicit` is false, and
/// `{path: [], name: ""}` otherwise.
export function completionPath(context: CompletionContext): {path: readonly string[], name: string} | null {
  let read = (node: SyntaxNode) => context.state.doc.sliceString(node.from, node.to)
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1)
  if (inner.name == "PropertyName") {
    return pathFor(read, inner.parent!, read(inner))
  } else if (dontComplete.indexOf(inner.name) > -1) {
    return null
  } else if (inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(read(inner))) {
    return {path: [], name: read(inner)}
  } else if ((inner.name == "." || inner.name == "?.") && inner.parent!.name == "MemberExpression") {
    return pathFor(read, inner.parent!, "")
  } else if (inner.name == "MemberExpression") {
    return pathFor(read, inner, "")
  } else {
    return context.explicit ? {path: [], name: ""} : null
  }
}

function enumeratePropertyCompletions(obj: any, top: boolean): readonly Completion[] {
  let options = [], seen: Set<string> = new Set
  for (let depth = 0;; depth++) {
    for (let name of (Object.getOwnPropertyNames || Object.keys)(obj)) {
      if (seen.has(name)) continue
      seen.add(name)
      let value
      try { value = obj[name] }
      catch(_) { continue }
      options.push({
        label: name,
        type: typeof value == "function" ? (/^[A-Z]/.test(name) ? "class" : top ? "function" : "method")
          : top ? "variable" : "property",
        boost: -depth
      })
    }
    let next = Object.getPrototypeOf(obj)
    if (!next) return options
    obj = next
  }
}

/// Defines a [completion source](#autocomplete.CompletionSource) that
/// completes from the given scope object (for example `globalThis`).
/// Will enter properties of the object when completing properties on
/// a directly-named path.
export function scopeCompletionSource(scope: any): CompletionSource {
  let cache: Map<any, readonly Completion[]> = new Map
  return (context: CompletionContext) => {
    let path = completionPath(context)
    if (!path) return null
    let target = scope
    for (let step of path.path) {
      target = target[step]
      if (!target) return null
    }
    let options = cache.get(target)
    if (!options) cache.set(target, options = enumeratePropertyCompletions(target, !path.path.length))
    return {
      from: context.pos - path.name.length,
      options,
      validFor: Identifier
    }
  }
}
