// CHANGE: use ESM imports/exports to satisfy no-require-imports
// WHY: lint forbids require-style imports; module format is ESM
// QUOTE(TZ): "use import"
// REF: user request 5
// SOURCE: n/a
// FORMAT THEOREM: forall f: exported(f) -> imported(f)
// PURITY: SHELL
// EFFECT: n/a
// INVARIANT: createRule is deterministic for a given name
// COMPLEXITY: O(1)/O(1)
import { ESLintUtils } from "@typescript-eslint/utils"

export interface ExampleTypedLintingRuleDocs {
  description: string
  recommended?: boolean
  requiresTypeChecking?: boolean
}

export const createRule = ESLintUtils.RuleCreator<ExampleTypedLintingRuleDocs>(
  (name) => `https://github.com/typescript-eslint/examples/tree/main/eslint-template/docs/${name}.md`
)
