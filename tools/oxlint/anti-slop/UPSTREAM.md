# Upstream provenance

This vendored Oxlint plugin is based on [`dmmulroy/anti-slop`](https://github.com/dmmulroy/anti-slop) at commit [`c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`](https://github.com/dmmulroy/anti-slop/tree/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b), resolved from `main` on 2026-09-18.

The copied implementation is the upstream `src/` tree, including the generic rules, optional Effect rules, shared helpers, and the vendored ESLint Stylistic license/provenance. Upstream RuleTester files are omitted from this application checkout; the plugin is consumed through `oxlint.config.ts` and is validated when Oxlint loads the configuration. The Effect rules are vendored for future opt-in use but are not enabled because `pi-search` has no direct `effect` dependency.

Dependencies are pinned together in the root manifest:

- `oxlint`: `1.83.0`
- `@oxlint/plugins`: `1.83.0`

`tools/oxlint/anti-slop/` is ignored by both Oxlint and Oxfmt so upstream code remains an inspectable vendored snapshot. Update it by reviewing the upstream diff and this provenance record; do not replace local changes blindly.
