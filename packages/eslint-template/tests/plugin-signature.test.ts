// CHANGE: make plugin signature test generic across any eslint plugin
// WHY: validate ESLint plugin shape without plugin-specific assumptions
// QUOTE(ТЗ): "проверил именно сигнатуру типов, полей"
// REF: user request 10
// SOURCE: n/a
// FORMAT THEOREM: ∀p: Plugin(p) → has(meta,rules,configs)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: plugin has rules with valid rule definitions
// COMPLEXITY: O(1)/O(1)
import type { TSESLint } from "@typescript-eslint/utils"
import { describe, expect, it } from "vitest"

import plugin from "../src/rules/index.js"

type PluginRules = NonNullable<TSESLint.FlatConfig.Plugin["rules"]>
type PluginRule = PluginRules[string]

const assertNonEmptyString = (value: string | undefined): void => {
  expect(typeof value).toBe("string")
  if (typeof value === "string") {
    expect(value.length).toBeGreaterThan(0)
  }
}

const assertRuleShape = (rule: PluginRule | undefined): void => {
  expect(rule).toBeDefined()
  if (!rule) {
    return
  }
  if (typeof rule === "function") {
    return
  }
  expect(typeof rule.create).toBe("function")
  if (rule.meta !== undefined) {
    expect(typeof rule.meta).toBe("object")
  }
}

const assertRulesShape = (
  rules: TSESLint.FlatConfig.Plugin["rules"] | undefined
): void => {
  expect(rules).toBeDefined()
  if (!rules) {
    return
  }

  const ruleNames = Object.keys(rules)
  expect(ruleNames.length).toBeGreaterThan(0)
  for (const ruleName of ruleNames) {
    const rule = rules[ruleName]
    assertRuleShape(rule)
  }
}

const assertRecommendedConfigShape = (
  configs: TSESLint.FlatConfig.Plugin["configs"] | undefined
): void => {
  expect(configs).toBeDefined()
  if (!configs) {
    return
  }

  const recommended = configs["recommended"]
  expect(recommended).toBeDefined()
  if (!recommended) {
    return
  }

  const configList = Array.isArray(recommended)
    ? recommended
    : [recommended]

  expect(configList.length).toBeGreaterThan(0)
  for (const config of configList) {
    expect(config.rules).toBeDefined()
    if (config.rules) {
      expect(Object.keys(config.rules).length).toBeGreaterThan(0)
    }
    expect(config.plugins).toBeDefined()
    if (config.plugins) {
      expect(Object.keys(config.plugins).length).toBeGreaterThan(0)
    }
  }
}

describe("eslint plugin signature", () => {
  it("satisfies eslint plugin signature", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    expect(pluginTyped).toBe(plugin)
  })

  it("exposes meta with name and version", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    assertNonEmptyString(pluginTyped.meta?.name)
    assertNonEmptyString(pluginTyped.meta?.version)
  })

  it("exposes rules with valid shape", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    assertRulesShape(pluginTyped.rules)
  })

  it("exposes recommended config", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    assertRecommendedConfigShape(pluginTyped.configs)
  })
})
