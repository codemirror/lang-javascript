import ist from "ist"
import {EditorState} from "@codemirror/state"
import {javascript} from "@codemirror/lang-javascript"
import {foldable} from "@codemirror/language"

function jsxState(doc: string) {
  return EditorState.create({doc, extensions: [javascript({jsx: true})]})
}

function fold(doc: string) {
  let state = jsxState(doc)
  const firstLine = doc.slice(0, doc.indexOf('\n'))
  const folded = foldable(state, 0, firstLine.length)
  if (folded) doc = doc.slice(0, folded.from) + ' ... ' + doc.slice(folded.to)
  return doc
}

describe("JSX folding", () => {
  it("should fold self-closing tags", () => {
    ist(fold(`<div \n />`), '<div ... />')
  })

  it("should fold self-closing tags with attributes", () => {
    ist(fold(`<div a="1" \n />`), '<div ... />')
  })

  it("should fold regular tags", () => {
    ist(fold(`<div>\n foo</div>`), '<div ... </div>')
  })

  it("should fold regular tags with attributes", () => {
    ist(fold(`<div a="1" >\nfoo</div>`), '<div ... </div>')
  })

  it("should fold regular tags with children", () => {
    ist(fold(`<div> \n<div>\nbar</div> </div>`), '<div ... </div>')
  })
  
  it("should fold fragment tags", () => {
    ist(fold(`<> \nsdf </>`), '<> ... </>')
  })

  it("should not fold inline tags", () => {
    ist(fold(`<div><div></div></div>`), '<div><div></div></div>')
  })
})

