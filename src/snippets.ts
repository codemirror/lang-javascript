import {Completion, snippetCompletion as snip} from "@codemirror/autocomplete"

/// A collection of JavaScript-related
/// [snippets](#autocomplete.snippet).
export const snippets: readonly Completion[] = [
  snip("function ${name}(${params}) {\n\t${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  snip("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  snip("for (let ${name} of ${collection}) {\n\t${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  snip("do {\n\t${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  snip("while (${}) {\n\t${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  snip("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  snip("if (${}) {\n\t${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  snip("if (${}) {\n\t${}\n} else {\n\t${}\n}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  snip("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  snip("import {${names}} from \"${module}\"\n${}", {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  snip("import ${name} from \"${module}\"\n${}", {
    label: "import",
    detail: "default",
    type: "keyword"
  })
]
