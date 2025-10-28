import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

const reactCoreConfig = pluginReact.configs.flat.recommended;
const reactJsxRuntimeConfig = pluginReact.configs.flat["jsx-runtime"];

const reactRecommended = {
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  plugins: {
    ...(reactCoreConfig.plugins ?? {}),
    ...(reactJsxRuntimeConfig.plugins ?? {}),
  },
  languageOptions: {
    ...(reactCoreConfig.languageOptions ?? {}),
    ...(reactJsxRuntimeConfig.languageOptions ?? {}),
    parserOptions: {
      ...(reactCoreConfig.languageOptions?.parserOptions ?? {}),
      ...(reactJsxRuntimeConfig.languageOptions?.parserOptions ?? {}),
    },
  },
  rules: {
    ...(reactCoreConfig.rules ?? {}),
    ...(reactJsxRuntimeConfig.rules ?? {}),
  },
  settings: {
    ...(reactCoreConfig.settings ?? {}),
    ...(reactJsxRuntimeConfig.settings ?? {}),
    react: { version: "detect" },
  },
};

export default defineConfig([
  { ignores: ["**/.claude/**", "**/dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-empty": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\\\b(?:bg|text|border|ring|from|via|to|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-[0-9]{1,3})?\\\\b/]",
          message:
            "Use design token utilities (e.g. bg-primary, text-muted-foreground) instead of Tailwind default color palette classes.",
        },
      ],
    },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  reactRecommended,
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark", extends: ["markdown/recommended"] },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
]);
