// CHANGE: add root entrypoint for eslint plugin build
// WHY: align compiled output with package exports (lib/index.*)
// QUOTE(TZ): n/a
// REF: user request 4
// SOURCE: n/a
// FORMAT THEOREM: forall p: plugin(p) -> exported(p)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: default export matches rules config
// COMPLEXITY: O(1)/O(1)
export { default } from "./rules/index.js"
