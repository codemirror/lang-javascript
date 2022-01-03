import {parser} from "@lezer/javascript"
import {LRLanguage, LanguageSupport,
        delimitedIndent, flatIndent, continuedIndent, indentNodeProp,
        foldNodeProp, foldInside} from "@codemirror/language"
import {styleTags, tags as t} from "@codemirror/highlight"
import {completeFromList, ifNotIn} from "@codemirror/autocomplete"
import {snippets} from "./snippets"

/// A language provider based on the [Lezer JavaScript
/// parser](https://github.com/lezer-parser/javascript), extended with
/// highlighting and indentation information.
export const javascriptLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        IfStatement: continuedIndent({except: /^\s*({|else\b)/}),
        TryStatement: continuedIndent({except: /^\s*({|catch\b|finally\b)/}),
        LabeledStatement: flatIndent,
        SwitchBody: context => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after)
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit
        },
        Block: delimitedIndent({closing: "}"}),
        ArrowFunction: cx => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => -1,
        "Statement Property": continuedIndent({except: /^{/}),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter)
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit)
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter)
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit)
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit
        }
      }),
      foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
        BlockComment(tree) { return {from: tree.from + 2, to: tree.to - 2} }
      }),
      styleTags({
        "get set async static": t.modifier,
        "for while do if else switch try catch finally return throw break continue default case": t.controlKeyword,
        "in of await yield void typeof delete instanceof": t.operatorKeyword,
        "let var const function class extends": t.definitionKeyword,
        "import export from": t.moduleKeyword,
        "with debugger as new": t.keyword,
        TemplateString: t.special(t.string),
        Super: t.atom,
        BooleanLiteral: t.bool,
        this: t.self,
        null: t.null,
        Star: t.modifier,
        VariableName: t.variableName,
        "CallExpression/VariableName": t.function(t.variableName),
        VariableDefinition: t.definition(t.variableName),
        Label: t.labelName,
        PropertyName: t.propertyName,
        PrivatePropertyName: t.special(t.propertyName),
        "CallExpression/MemberExpression/PropertyName": t.function(t.propertyName),
        "FunctionDeclaration/VariableDefinition": t.function(t.definition(t.variableName)),
        "ClassDeclaration/VariableDefinition": t.definition(t.className),
        PropertyDefinition: t.definition(t.propertyName),
        PrivatePropertyDefinition: t.definition(t.special(t.propertyName)),
        UpdateOp: t.updateOperator,
        LineComment: t.lineComment,
        BlockComment: t.blockComment,
        Number: t.number,
        String: t.string,
        ArithOp: t.arithmeticOperator,
        LogicOp: t.logicOperator,
        BitOp: t.bitwiseOperator,
        CompareOp: t.compareOperator,
        RegExp: t.regexp,
        Equals: t.definitionOperator,
        "Arrow : Spread": t.punctuation,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.brace,
        ".": t.derefOperator,
        ", ;": t.separator,

        TypeName: t.typeName,
        TypeDefinition: t.definition(t.typeName),
        "type enum interface implements namespace module declare": t.definitionKeyword,
        "abstract global Privacy readonly override": t.modifier,
        "is keyof unique infer": t.operatorKeyword,

        JSXAttributeValue: t.attributeValue,
        JSXText: t.content,
        "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": t.angleBracket,
        "JSXIdentifier JSXNameSpacedName": t.tagName,
        "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": t.attributeName
      })
    ]
  }),
  languageData: {
    closeBrackets: {brackets: ["(", "[", "{", "'", '"', "`"]},
    commentTokens: {line: "//", block: {open: "/*", close: "*/"}},
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
})

/// A language provider for TypeScript.
export const typescriptLanguage = javascriptLanguage.configure({dialect: "ts"})

/// Language provider for JSX.
export const jsxLanguage = javascriptLanguage.configure({dialect: "jsx"})

/// Language provider for JSX + TypeScript.
export const tsxLanguage = javascriptLanguage.configure({dialect: "jsx ts"})

/// JavaScript support. Includes [snippet](#lang-javascript.snippets)
/// completion.
export function javascript(config: {jsx?: boolean, typescript?: boolean} = {}) {
  let lang = config.jsx ? (config.typescript ? tsxLanguage : jsxLanguage)
    : config.typescript ? typescriptLanguage : javascriptLanguage
  return new LanguageSupport(lang, javascriptLanguage.data.of({
    autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
  }))
}
