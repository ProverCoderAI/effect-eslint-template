// CHANGE: use ESM imports/exports to satisfy no-require-imports
// WHY: lint forbids require-style imports; module format is ESM
// QUOTE(TZ): "use import"
// REF: user request 5
// SOURCE: n/a
// FORMAT THEOREM: forall r: rule(r) -> imported(r)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: rules map keys are stable identifiers
// COMPLEXITY: O(1)/O(1)
import { rule as noLoopOverEnums } from "../../shell/no-loop-over-enum.js"

export const rules = {
  // CHANGE: align rule key with actual rule name used in configs/tests
  // WHY: mismatched key prevents ESLint from resolving the rule
  // QUOTE(ТЗ): "Такой код не вызывает никаких ошибок"
  // REF: user request 6
  // SOURCE: n/a
  // FORMAT THEOREM: forall r: ruleKey(r) = configKey(r) -> resolved(r)
  // PURITY: CORE
  // EFFECT: n/a
  // INVARIANT: rule key is stable and matches "no-loop-over-enum"
  // COMPLEXITY: O(1)/O(1)
  "no-loop-over-enum": noLoopOverEnums
}
