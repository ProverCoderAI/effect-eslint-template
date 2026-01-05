import { RuleTester } from "@typescript-eslint/rule-tester"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tseslint from "typescript-eslint"
import * as vitest from "vitest"

import { rule } from "../src/shell/no-loop-over-enum.js"

RuleTester.afterAll = vitest.afterAll
RuleTester.it = vitest.it
RuleTester.itOnly = vitest.it.only
RuleTester.describe = vitest.describe

// CHANGE: resolve tsconfigRootDir from import.meta.url without __dirname
// WHY: keep ESM-safe path resolution and avoid unsafe process typings
// QUOTE(TZ): "Do not use \"__dirname\"."
// REF: user request 1
// SOURCE: n/a
// FORMAT THEOREM: forall u in URL: dir(fileURLToPath(u)) is deterministic
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: tsconfigRootDir ends with "/packages/eslint-template"
// COMPLEXITY: O(1)/O(1)
const tsconfigRootDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.ts*"],
        defaultProject: "tsconfig.json"
      },
      tsconfigRootDir
    }
  }
})

ruleTester.run("no-loop-over-enum", rule, {
  valid: [
    `enum Values {}`,
    `for (const a in []) {}`,
    `for (const a of []) {}`,
    `
      const values = {};
      for (const a in values) {}
    `,
    `
      const values = [];
      for (const a of values) {}
    `
  ],
  invalid: [
    {
      code: `
          enum Values {}
          for (const a in Values) {}
      `,
      errors: [
        {
          column: 27,
          endColumn: 33,
          line: 3,
          endLine: 3,
          messageId: "loopOverEnum"
        }
      ]
    }
  ]
})
