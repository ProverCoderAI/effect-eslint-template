// CHANGE: use ESM imports to satisfy no-require-imports
// WHY: lint forbids require-style imports; module format is ESM
// QUOTE(TZ): "use import"
// REF: user request 5
// SOURCE: n/a
// FORMAT THEOREM: forall m: import(m) -> bound(m)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: plugin.meta has stable name/version values
// COMPLEXITY: O(1)/O(1)
import type { TSESLint } from "@typescript-eslint/utils"
import type { Linter } from "eslint"

import { toEslintPlugin } from "../core/axioms.js"
import { name, version } from "../core/plugin-meta.js"
import { rules } from "./rules/index.js"

// CHANGE: align config types with ESLint core to avoid defineConfig incompatibility
// WHY: @typescript-eslint/utils FlatConfig.LanguageOptions lacks index signature required by @eslint/core
// QUOTE(ТЗ): "Argument of type 'Config | ConfigArray' is not assignable..."
// REF: user request 2025-12-25
// SOURCE: n/a
// FORMAT THEOREM: ∀c ∈ Config: compatible(c, @eslint/core) → assignable(c, defineConfig)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: configs.recommended is ESLint flat config
// COMPLEXITY: O(1)/O(1)
type PluginConfig = Linter.Config

// CHANGE: avoid tseslint/core type collision on plugin.configs by removing configs from base
// WHY: configs are typed to @eslint/core for defineConfig, rules stay typed via @typescript-eslint/utils
// QUOTE(ТЗ): "Argument of type 'Config | ConfigArray' is not assignable..."
// REF: user request 2025-12-25
// SOURCE: n/a
// FORMAT THEOREM: ∀p: PluginBase(p) ∧ configs(p)⊥ → wellTyped(p, core ∪ tseslint)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: plugin base never depends on configs typing
// COMPLEXITY: O(1)/O(1)
type PluginBase = Omit<TSESLint.FlatConfig.Plugin, "configs">

// CHANGE: strengthen plugin type so configs are non-optional for consumers
// WHY: avoid optional access/casts when using plugin.configs.recommended
// QUOTE(ТЗ): "Что бы мне не приходилось писать дополнительные касты"
// REF: user request (index.ts fix)
// SOURCE: n/a
// FORMAT THEOREM: ∀p: PluginWithConfigs(p) → defined(p.configs.recommended)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: configs.recommended is always present
// COMPLEXITY: O(1)/O(1)
type PluginWithConfigs = PluginBase & {
  readonly configs: {
    readonly recommended: PluginConfig
  }
}

// CHANGE: split base plugin from configs to avoid getter complexity
// WHY: sonarjs requires consistent return type; flat config expects plain values
// QUOTE(ТЗ): "Исправь все ошибки линтинга"
// REF: user request 13
// SOURCE: n/a
// FORMAT THEOREM: ∀p: Plugin(p) → configs(p) is pure data
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: recommended config references plugin base
// COMPLEXITY: O(1)/O(1)
const pluginBase: PluginBase = {
  meta: { name, version },
  rules
}

// CHANGE: fix recommended config to use proper rule severity mapping
// WHY: ESLint expects rule config values, not rule definitions
// QUOTE(ТЗ): "Configuration for rule \"no-loop-over-enum\" is invalid."
// REF: user request 7
// SOURCE: n/a
// FORMAT THEOREM: forall r: enabled(r) -> severity(r) ∈ {off,warn,error}
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: recommended config uses namespaced rule key
// COMPLEXITY: O(1)/O(1)
const recommended: PluginConfig = {
  plugins: {
    "example-typed-linting": toEslintPlugin(pluginBase)
  },
  rules: {
    "example-typed-linting/no-loop-over-enum": "error"
  }
}

const plugin: PluginWithConfigs = {
  ...pluginBase,
  configs: {
    recommended
  }
}

export default plugin
