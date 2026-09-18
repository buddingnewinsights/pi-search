import { defineConfig } from "oxlint";

export default defineConfig({
	ignorePatterns: [".pi/**", "coverage/**", "dist/**", "node_modules/**", "tools/oxlint/anti-slop/**"],
	jsPlugins: [
		{
			name: "anti-slop",
			specifier: "./tools/oxlint/anti-slop/index.ts",
		},
	],
	rules: {
		"oxc/no-accumulating-spread": "error",
		"anti-slop/no-array-filter-map": "warn",
		"anti-slop/no-reduce-accumulator-copy": "error",
		"anti-slop/no-chained-type-assertions": "warn",
		"anti-slop/no-conditional-empty-object-spread": "warn",
		"anti-slop/no-known-value-widening": "warn",
		"anti-slop/no-module-mocking": "warn",
		"anti-slop/no-object-parameters": "error",
		"anti-slop/no-reflect-apply": "error",
		"anti-slop/no-reflect-get": "warn",
		"anti-slop/no-runtime-typeof": "warn",
		"anti-slop/no-shape-in-symbol-names": "error",
		"anti-slop/no-unknown-parameters": "warn",
		"anti-slop/no-unknown-returns": "warn",
		"anti-slop/no-unknown-type-aliases": "error",
		"anti-slop/no-unsafe-dictionary-type": "warn",
		"anti-slop/no-widen-then-assert": "error",
		"anti-slop/require-readable-spacing": "warn",
		"anti-slop/require-safety-comment-for-type-assertion": "warn",
	},
});
