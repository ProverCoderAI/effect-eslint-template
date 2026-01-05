// CHANGE: use ESM imports/exports to satisfy no-require-imports
// WHY: lint forbids require-style imports; module format is ESM
// QUOTE(TZ): "use import"
// REF: user request 5
// SOURCE: n/a
// FORMAT THEOREM: forall n: node(n) -> typeChecked(n)
// PURITY: SHELL
// EFFECT: n/a
// INVARIANT: enum loop detection preserves rule soundness
// COMPLEXITY: O(1)/O(1)
import { ESLintUtils } from "@typescript-eslint/utils"

import { isEnumType } from "../core/no-loop-over-enum.js"
import { createRule } from "./create-rule.js"

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context)

    return {
      ForInStatement(node) {
        const type = services.getTypeAtLocation(node.right)

        if (isEnumType(type)) {
          context.report({
            messageId: "loopOverEnum",
            node: node.right
          })
        }
      }
    }
  },
  meta: {
    docs: {
      description: "Avoid looping over enums.",
      recommended: true,
      requiresTypeChecking: true
    },
    messages: {
      loopOverEnum: "Do not loop over enums."
    },
    type: "suggestion",
    schema: []
  },
  name: "no-loop-over-enum",
  defaultOptions: []
})
