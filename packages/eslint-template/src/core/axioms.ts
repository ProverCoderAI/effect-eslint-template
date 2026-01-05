// CHANGE: introduce axiomatic bridge between tseslint plugin type and ESLint core plugin type
// WHY: defineConfig expects @eslint/core plugin typing while rules are authored with @typescript-eslint/utils
// QUOTE(ТЗ): "Argument of type 'Config | ConfigArray' is not assignable..."
// REF: user request 2025-12-25
// SOURCE: n/a
// FORMAT THEOREM: ∀p: Plugin(p) → coreView(p) ≡ p
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: returned reference is exactly the input reference
// COMPLEXITY: O(1)/O(1)
import type { TSESLint } from "@typescript-eslint/utils"
import type { ESLint } from "eslint"

/**
 * Provides a typed bridge for plugins authored with @typescript-eslint/utils
 * when a core-typed plugin is required (e.g., ESLint defineConfig).
 *
 * @param plugin - Plugin authored with @typescript-eslint/utils rule definitions
 * @returns Same plugin value viewed as ESLint core plugin type
 *
 * @pure true - type-level reinterpretation only
 * @effect n/a
 * @invariant ∀p: toEslintPlugin(p) === p
 * @precondition plugin.rules are runtime-compatible with ESLint core
 * @postcondition referential equality preserved
 * @complexity O(1)
 * @throws Never - no runtime exceptions
 */
export const toEslintPlugin = (
  plugin: TSESLint.FlatConfig.Plugin
): ESLint.Plugin => plugin as never as ESLint.Plugin
