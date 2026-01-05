// CHANGE: introduce compile-time plugin metadata constants without runtime require
// WHY: keep metadata pure and avoid restricted require/ESLint directives
// QUOTE(TZ): "Avoid using require(). Use ES6 imports instead."
// REF: user request 1
// SOURCE: n/a
// FORMAT THEOREM: forall m in {name, version}: defined(m) -> stable(m)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: name != "" && version != ""
// COMPLEXITY: O(1)/O(1)
export const name = "eslint-template"
export const version = "0.0.0"
