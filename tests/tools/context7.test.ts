import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createContext7Tool } from "../../src/tools/context7.js";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
// Never read the real user config (~/.pi/pi-search.json) during tests.
const HERMETIC_CONFIG = join(tmpdir(), "pi-search-test-absent.json");

describe("context7 tool", () => {
	beforeEach(() => {
		for (const key of Object.keys(process.env)) delete process.env[key];
		process.env.PI_SEARCH_CONFIG_PATH = HERMETIC_CONFIG;
	});
	afterEach(() => {
		globalThis.fetch = originalFetch;
		for (const key of Object.keys(process.env)) delete process.env[key];
		Object.assign(process.env, originalEnv);
	});

	it("has the expected schema and label", () => {
		const tool = createContext7Tool({} as never);
		expect(tool.name).toBe("context7");
		expect(tool.label).toBe("⚙ context7");
		expect((tool.parameters as { required?: string[] }).required).toContain("libraryName");
	});

	it("rejects missing libraryName with validation_error", async () => {
		const tool = createContext7Tool({} as never);
		const result = await tool.execute("id", {}, undefined, undefined);
		expect((result.details as { error: { code: string } }).error.code).toBe("validation_error");
		expect((result.details as { error: { message: string } }).error.message).toMatch(/libraryName/);
	});

	it("resolves library ID then fetches docs", async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ results: [{ id: "/reactjs/react.dev", title: "React" }] }), { status: 200 }),
			)
			.mockResolvedValueOnce(
				new Response("### Hooks\nuseState...", { status: 200, headers: { "content-type": "text/plain" } }),
			);
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const tool = createContext7Tool({} as never);
		const result = await tool.execute("id", { libraryName: "react", topic: "hooks" }, undefined, undefined);
		expect(result.content[0].text).toContain("useState");
		expect((result.details as { libraryId: string }).libraryId).toBe("/reactjs/react.dev");
	});

	it("respects context7 disabledTools", async () => {
		process.env.PI_SEARCH_DISABLED_TOOLS = "context7";
		const tool = createContext7Tool({} as never);
		const result = await tool.execute("id", { libraryName: "react" }, undefined, undefined);
		expect((result.details as { error: { code: string } }).error.code).toBe("validation_error");
	});
});
