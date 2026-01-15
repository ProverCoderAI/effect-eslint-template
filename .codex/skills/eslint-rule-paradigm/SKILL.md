---
name: eslint-rule-paradigm
description: Best-practice workflow for designing, implementing, and testing ESLint rules/plugins (meta, schema/defaultOptions, RuleTester, fixes/suggestions, flat config). Includes authoritative links, example sources, test templates, packaging that supports `defineConfig(plugin.configs.recommended)`, and repo integration via `pnpm run lint-app`.
---

# ESLint Rule Paradigm

## When to use

* Creating a new ESLint rule or refactoring an existing one
* Building/maintaining plugin configs (especially for flat config)
* Adding analyzers and validating behavior in a realistic TS project (packages/app)

---

## Primary docs (authoritative)

ESLint:

* Custom rules: https://eslint.org/docs/latest/extend/custom-rules
* Custom rule tutorial: https://eslint.org/docs/latest/extend/custom-rule-tutorial
* Plugins (shape, exports): https://eslint.org/docs/latest/extend/plugins
* Flat config - configure plugins: https://eslint.org/docs/latest/use/configure/plugins
* Plugin migration to flat config (meta.name, meta.version, recommended structure): https://eslint.org/docs/latest/extend/plugin-migration-flat-config
* Node.js API - RuleTester basics: https://eslint.org/docs/latest/integrate/nodejs-api

TypeScript ecosystem:

* typescript-eslint custom rules: https://typescript-eslint.io/developers/custom-rules/
* @typescript-eslint/rule-tester: https://typescript-eslint.io/packages/rule-tester/

---

## Where to copy examples from (high signal)

1. ESLint core repo (canonical layout and style):

   * rules: `lib/rules/*`
   * tests: `tests/lib/rules/*`
   * docs: `docs/src/rules/*`
   * repo: https://github.com/eslint/eslint

2. ESLint Custom Rule Tutorial:

   * small end-to-end example with RuleTester + packaging

3. typescript-eslint docs and packages:

   * patterns for typed rules, parser services, safer ergonomics

---

## Core workflow

1. **Problem framing**

   * Specify the invariant precisely: forbidden/required property.
   * Specify the exact AST contexts: node kinds + minimal data required.
   * Decide if you need types or pure syntax is enough.

2. **Rule classification**

   * `meta.type`: `problem | suggestion | layout`
   * Autofix -> set `meta.fixable: "code" | "whitespace"`
   * Suggestions -> set `meta.hasSuggestions: true`

3. **Options contract first**

   * `meta.schema`: JSON Schema for options (`[]` if no options).
   * `defaultOptions`: top-level export field (NOT inside `meta`).
   * Compatibility:

     * don't change meaning of existing options
     * add new options as optional with defaults

4. **Messages contract**

   * Put all messages under `meta.messages`.
   * Report via `{ messageId, data }`.
   * Keep message IDs stable (they're public API).

5. **Implementation constraints**

   * Deterministic, no I/O, no global state.
   * No AST mutation.
   * Performance:

     * avoid expensive scans per-node
     * cache derived data from `context.getSourceCode()`
     * for cross-file-ish logic within one file: collect in visitors, finalize in `Program:exit`

6. **Type-aware path (optional)**

   * Only touch types when parser services exist.
   * If types are required: document requirement and fail gracefully (no crash).

7. **Testing**

   * Unit tests: RuleTester (valid/invalid + options + fix/suggestions).
   * Integration loop: `packages/app` via `pnpm run lint-app` (realistic output).

8. **Packaging**

   * Export plugin object with `meta`, `rules`, `configs`.
   * Ensure flat-config `recommended` works standalone via `defineConfig(plugin.configs.recommended)`.

---

# Templates

## Minimal rule skeleton

```js
export default {
  meta: {
    type: "suggestion",
    docs: { description: "...", recommended: false },
    schema: [],
    messages: {
      bad: "...",
    },
    // fixable: "code",      // only if you provide `fix`
    // hasSuggestions: true,  // only if you provide `suggest`
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Identifier(node) {
        // lightweight analysis
        context.report({ node, messageId: "bad" });
      },
    };
  },
};
```

## Fix vs suggestion policy

* Use **autofix** only if the transform is local + unambiguous + syntax-safe + semantics-safe.
* If there is any ambiguity, prefer **suggestions**.

---

# Testing templates (RuleTester)

## Baseline RuleTester (ESLint)

```js
import rule from "../src/rules/my-rule.js";
import { RuleTester } from "eslint";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("my-rule", rule, {
  valid: [
    "const ok = 1;",
    { code: "const ok2 = 2;", options: [{ someOpt: true }] },
  ],
  invalid: [
    {
      code: "const bad = 1;",
      options: [{ someOpt: false }],
      errors: [{ messageId: "bad" }],
    },
  ],
});
```

## Autofix test

```js
ruleTester.run("my-rule", rule, {
  valid: [],
  invalid: [
    {
      code: "let x = 1;",
      output: "const x = 1;",
      errors: [{ messageId: "useConst" }],
    },
  ],
});
```

## Suggestions test

```js
ruleTester.run("my-rule", rule, {
  valid: [],
  invalid: [
    {
      code: "const foo = 'baz';",
      errors: [
        {
          messageId: "wrongFoo",
          suggestions: [
            { messageId: "replaceWithBar", output: "const foo = 'bar';" },
          ],
        },
      ],
    },
  ],
});
```

## TS-friendly testing (@typescript-eslint/rule-tester)

```ts
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../src/rules/my-rule";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("my-rule", rule, {
  valid: [{ code: "const x: number = 1;" }],
  invalid: [{ code: "const y: any = 1;", errors: [{ messageId: "noAny" }] }],
});
```

### Error assertion checklist

* Always assert `messageId`.
* Assert `data` keys when used.
* Use `output` for fixes.
* Use `suggestions: [{ messageId, output }]` for suggestions.

---

# Flat config packaging that never errors with `defineConfig(plugin.configs.recommended)`

## Goal

Your plugin must be usable like this (no extra `plugins: {}` required in user config):

```ts
import plugin from "<plugin-package-name>";
import { defineConfig } from "eslint/config";

export default defineConfig(
  plugin.configs.recommended,
  // optional overrides
);
```

## Invariant (must hold)

`configs.recommended` MUST be a flat config object (or an array of flat config objects) that **self-registers the plugin**:

* `plugins: { "<plugin-namespace>": pluginObject }`
* `rules: { "<plugin-namespace>/<rule>": "error" | ... }`

If `configs.recommended` does not include `plugins: { namespace: plugin }`, ESLint will report "unknown rule" / "plugin missing" when the user only spreads recommended.

## Recommended implementation pattern (no circular refs problems)

Define `plugin` first, then attach configs using `Object.assign`, so `configs.recommended` can reference `plugin`.

```ts
import type { Linter } from "eslint";

const plugin = {
  meta: {
    name: "<plugin-package-name>",
    version: "1.0.0",
  },
  rules: {
    "<rule-a>": ruleA,
    "<rule-b>": ruleB,
    "<rule-c>": ruleC,
    "<rule-d>": ruleD,
  },
  configs: {},
} satisfies Linter.Plugin;

Object.assign(plugin.configs, {
  recommended: {
    name: "<plugin-namespace>/recommended",
    plugins: {
      "<plugin-namespace>": plugin,
    },
    rules: {
      "<plugin-namespace>/<rule-a>": "error",
      "<plugin-namespace>/<rule-b>": "error",
      "<plugin-namespace>/<rule-c>": "error",
      "<plugin-namespace>/<rule-d>": "error",
    },
  } satisfies Linter.FlatConfig,
});

export default plugin;
```

### Notes

* Namespace (`"<plugin-namespace>"`) must match what you want in rule IDs (`<plugin-namespace>/<rule>`).
* In `plugin.rules`, keys do NOT include namespace.
* In `configs.recommended.rules`, keys DO include namespace.

## If you prefer `recommended` as an array

This is also valid and composes better when you need multiple layers.

```ts
Object.assign(plugin.configs, {
  recommended: [
    {
      name: "<plugin-namespace>/recommended",
      plugins: { "<plugin-namespace>": plugin },
      rules: {
        "<plugin-namespace>/<rule-a>": "error",
        "<plugin-namespace>/<rule-b>": "error",
      },
    },
    {
      name: "<plugin-namespace>/recommended-overrides",
      rules: {
        "<plugin-namespace>/<rule-c>": "warn",
      },
    },
  ] satisfies Linter.FlatConfig[],
});
```

---

# Repo integration: `packages/app` (live playground)

## Purpose

`packages/app` is an intentionally imperfect TS app used to validate analyzers/rules in a realistic run.
You intentionally introduce mistakes (typos, wrong names, missing imports, etc.) to verify:

* your rule triggers
* message wording is correct
* suggestions/fixes appear where intended

## Run

From repo root:

```bash
pnpm run lint-app
```

This runs linting for `@effect-template/app` and prints diagnostics from ESLint (and other tools in the pipeline). Use it as fast feedback.

## How to add a new scenario

* Add/change code under `packages/app/src/**` to trigger one intended analyzer.
* Keep each scenario small and isolated.
* Use recognizable "intentional mistakes" (e.g. `ru1Main`, `modul3`, `formatGree7ing`) so the output is self-explanatory.

## Guardrails

* Don't "fix" the playground errors unless you are intentionally changing expected analyzer behavior.
* If you change messages/suggestions, update:

  * unit tests (RuleTester)
  * and playground scenarios if they serve as demonstration

---

# Ship-ready checklist

* [ ] invariant is precise (AST scope + intended behavior)
* [ ] `meta.type` chosen; `meta.fixable`/`meta.hasSuggestions` consistent with behavior
* [ ] `meta.schema` + `defaultOptions` defined first; options compatibility preserved
* [ ] reports use `messageId` (+ `data`), messages stable
* [ ] perf: no heavy scans per-node; caching or `Program:exit` aggregation
* [ ] RuleTester covers: valid/invalid, option matrix, fixes/suggestions, edge syntax
* [ ] `packages/app` scenario demonstrates analyzer (`pnpm run lint-app`)
* [ ] `configs.recommended` is self-contained and works via `defineConfig(plugin.configs.recommended)`
