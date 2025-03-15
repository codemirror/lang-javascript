import {Diagnostic} from "@codemirror/lint"
import {Text} from "@codemirror/state"
import {EditorView} from "@codemirror/view"
import {javascriptLanguage} from "./javascript"

/// Connects an [ESLint](https://eslint.org/) linter to CodeMirror's
/// [lint](#lint) integration. `eslint` should be an instance of the
/// [`Linter`](https://eslint.org/docs/developer-guide/nodejs-api#linter)
/// class, and `config` an optional ESLint configuration. The return
/// value of this function can be passed to [`linter`](#lint.linter)
/// to create a JavaScript linting extension.
///
/// Note that ESLint targets node, and is tricky to run in the
/// browser. The
/// [eslint-linter-browserify](https://github.com/UziTech/eslint-linter-browserify)
/// package may help with that (see
/// [example](https://github.com/UziTech/eslint-linter-browserify/blob/master/example/script.js)).
export function esLint(eslint: any, config?: any) {
  if (!config) {
    config = {
      parserOptions: {ecmaVersion: 2019, sourceType: "module"},
      env: {browser: true, node: true, es6: true, es2015: true, es2017: true, es2020: true},
      rules: {}
    }
    eslint.getRules().forEach((desc: any, name: string) => {
      if (desc.meta.docs?.recommended) config.rules[name] = 2
    })
  }

  return (view: EditorView) => {
    let {state} = view, found: Diagnostic[] = []
    for (let {from, to} of javascriptLanguage.findRegions(state)) {
      let fromLine = state.doc.lineAt(from), offset = {line: fromLine.number - 1, col: from - fromLine.from, pos: from}
      for (let d of eslint.verify(state.sliceDoc(from, to), config))
        found.push(translateDiagnostic(d, state.doc, offset))
    }
    return found
  }
}

function mapPos(line: number, col: number, doc: Text, offset: {line: number, col: number, pos: number}) {
  return doc.line(line + offset.line).from + col + (line == 1 ? offset.col - 1 : -1)
}

function translateDiagnostic(input: any, doc: Text, offset: {line: number, col: number, pos: number}): Diagnostic {
  let start = mapPos(input.line, input.column, doc, offset)
  let result: Diagnostic = {
    from: start,
    to: input.endLine != null && input.endColumn != 1 ? mapPos(input.endLine, input.endColumn, doc, offset) : start,
    message: input.message,
    source: input.ruleId ? "eslint:" + input.ruleId : "eslint",
    severity: input.severity == 1 ? "warning" : "error",
  }
  if (input.fix) {
    let {range, text} = input.fix, from = range[0] + offset.pos - start, to = range[1] + offset.pos - start
    result.actions = [{
      name: "fix",
      apply(view: EditorView, start: number) {
        view.dispatch({changes: {from: start + from, to: start + to, insert: text}, scrollIntoView: true})
      }
    }]
  }
  return result
}
