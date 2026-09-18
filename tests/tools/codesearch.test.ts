import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCodesearchTool } from "../../src/tools/codesearch.js";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
// Never read the real user config (~/.pi/pi-search.json) during tests.
const HERMETIC_CONFIG = join(tmpdir(), "pi-search-codesearch-test-absent.json");

describe("codesearch tool", () => {
	beforeEach(() => {
		for (const key of Object.keys(process.env)) delete process.env[key];
		Object.assign(process.env, {
			PI_SEARCH_CONFIG_PATH: HERMETIC_CONFIG,
			PI_SEARCH_USE_REST: "true",
			EXA_API_KEY: "test-key",
		});
	});
	afterEach(() => {
		globalThis.fetch = originalFetch;
		for (const key of Object.keys(process.env)) delete process.env[key];
		Object.assign(process.env, originalEnv);
	});

	it("has the expected schema and label", () => {
		const tool = createCodesearchTool({} as never);
		expect(tool.name).toBe("codesearch");
		expect(tool.label).toBe("⚙ codesearch");
	});

	it("calls the direct REST endpoint with default searchType=neural", async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify({ results: [{ title: "Code", url: "https://x.com" }] }), { status: 200 }),
			);
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const tool = createCodesearchTool({} as never);
		await tool.execute("id", { query: "react hooks" }, undefined, undefined);

		const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
		expect(body.type).toBe("neural");
	});

	it("respects codesearch disabledTools via env", async () => {
		process.env.PI_SEARCH_DISABLED_TOOLS = "codesearch";
		const tool = createCodesearchTool({} as never);
		const result = await tool.execute("id", { query: "x" }, undefined, undefined);
		expect((result.details as { error: { code: string } }).error.code).toBe("validation_error");
	});
});
