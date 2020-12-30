<!-- NOTE: README.md is generated from src/README.md -->

# @codemirror/lang-javascript [![NPM version](https://img.shields.io/npm/v/@codemirror/lang-javascript.svg)](https://www.npmjs.org/package/@codemirror/lang-javascript)

[ [**WEBSITE**](https://codemirror.net/6/) | [**ISSUES**](https://github.com/codemirror/codemirror.next/issues) | [**FORUM**](https://discuss.codemirror.net/c/next/) | [**CHANGELOG**](https://github.com/codemirror/lang-javascript/blob/main/CHANGELOG.md) ]

This package implements JavaScript language support for the
[CodeMirror](https://codemirror.net/6/) code editor.

The [project page](https://codemirror.net/6/) has more information, a
number of [examples](https://codemirror.net/6/examples/) and the
[documentation](https://codemirror.net/6/docs/).

This code is released under an
[MIT license](https://github.com/codemirror/lang-javascript/tree/main/LICENSE).

We aim to be an inclusive, welcoming community. To make that explicit,
we have a [code of
conduct](http://contributor-covenant.org/version/1/1/0/) that applies
to communication around the project.

## API Reference
<dl>
<dt id="user-content-javascript">
  <code><strong><a href="#user-content-javascript">javascript</a></strong>(<a id="user-content-javascript^config" href="#user-content-javascript^config">config</a>&#8288;?: {jsx&#8288;?: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>, typescript&#8288;?: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>} = {}) → <a href="https://codemirror.net/6/docs/ref#language.LanguageSupport">LanguageSupport</a></code></dt>

<dd><p>JavaScript support. Includes <a href="#user-content-snippets">snippet</a>
completion.</p>
</dd>
<dt id="user-content-javascriptlanguage">
  <code><strong><a href="#user-content-javascriptlanguage">javascriptLanguage</a></strong>: <a href="https://codemirror.net/6/docs/ref#language.LezerLanguage">LezerLanguage</a></code></dt>

<dd><p>A language provider based on the <a href="https://github.com/lezer-parser/javascript">Lezer JavaScript
parser</a>, extended with
highlighting and indentation information.</p>
</dd>
<dt id="user-content-typescriptlanguage">
  <code><strong><a href="#user-content-typescriptlanguage">typescriptLanguage</a></strong>: <a href="https://codemirror.net/6/docs/ref#language.LezerLanguage">LezerLanguage</a></code></dt>

<dd><p>A language provider for TypeScript.</p>
</dd>
<dt id="user-content-jsxlanguage">
  <code><strong><a href="#user-content-jsxlanguage">jsxLanguage</a></strong>: <a href="https://codemirror.net/6/docs/ref#language.LezerLanguage">LezerLanguage</a></code></dt>

<dd><p>Language provider for JSX.</p>
</dd>
<dt id="user-content-tsxlanguage">
  <code><strong><a href="#user-content-tsxlanguage">tsxLanguage</a></strong>: <a href="https://codemirror.net/6/docs/ref#language.LezerLanguage">LezerLanguage</a></code></dt>

<dd><p>Language provider for JSX + TypeScript.</p>
</dd>
<dt id="user-content-snippets">
  <code><strong><a href="#user-content-snippets">snippets</a></strong>: readonly <a href="https://codemirror.net/6/docs/ref#autocomplete.Completion">Completion</a>[]</code></dt>

<dd><p>A collection of JavaScript-related
<a href="https://codemirror.net/6/docs/ref/#autocomplete.snippet">snippets</a>.</p>
</dd>
<dt id="user-content-eslint">
  <code><strong><a href="#user-content-eslint">esLint</a></strong>(<a id="user-content-eslint^eslint" href="#user-content-eslint^eslint">eslint</a>: any, <a id="user-content-eslint^config" href="#user-content-eslint^config">config</a>&#8288;?: any) → fn(<a id="user-content-eslint^returns^view" href="#user-content-eslint^returns^view">view</a>: <a href="https://codemirror.net/6/docs/ref#view.EditorView">EditorView</a>) → <a href="https://codemirror.net/6/docs/ref#lint.Diagnostic">Diagnostic</a>[]</code></dt>

<dd><p>Connects an <a href="https://eslint.org/">ESLint</a> linter to CodeMirror's
<a href="https://codemirror.net/6/docs/ref/#lint">lint</a> integration. <code>eslint</code> should be an instance of the
<a href="https://eslint.org/docs/developer-guide/nodejs-api#linter"><code>Linter</code></a>
class, and <code>config</code> an optional ESLint configuration. The return
value of this function can be passed to <a href="https://codemirror.net/6/docs/ref/#lint.linter"><code>linter</code></a>
to create a JavaScript linting extension.</p>
<p>Note that ESLint targets node, and is tricky to run in the
browser. The <a href="https://github.com/mysticatea/eslint4b">eslint4b</a>
and
<a href="https://github.com/marijnh/eslint4b-prebuilt/">eslint4b-prebuilt</a>
packages may help with that.</p>
</dd>
</dl>

