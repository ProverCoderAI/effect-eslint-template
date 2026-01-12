// eslint.config.mjs
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitest from "eslint-plugin-vitest";
import suggestMembers from "@prover-coder-ai/eslint-plugin-suggest-members";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import * as effectEslint from "@effect/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import codegen from "eslint-plugin-codegen";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import globals from "globals";
import eslintCommentsConfigs from "@eslint-community/eslint-plugin-eslint-comments/configs";
import exampleTypedLinting from "@effect-template/eslint-template";

const codegenPlugin = fixupPluginRules(
	codegen as unknown as Parameters<typeof fixupPluginRules>[0],
);

export default tseslint.config(
  exampleTypedLinting.configs.recommended,
  {
    ...suggestMembers.configs.recommended,
    files: ["**/*.{ts,tsx,js,jsx}"]
  },
  {
    name: "analyzers",
    languageOptions: {
      parser: tseslint.parser,
	  globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
	files: ["**/*.ts", '**/*.{test,spec}.{ts,tsx}', '**/tests/**', '**/__tests__/**'],
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
  },
  // 3) Для JS-файлов отключим типо-зависимые проверки
  {
    files: ['**/*.{js,cjs,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // 4) Глобальные игноры
  { ignores: ['dist/**', 'build/**', 'coverage/**', '**/dist/**'] },
);
