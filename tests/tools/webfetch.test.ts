import { describe, expect, it, vi } from "vitest";
import { createWebFetchTool } from "../../src/tools/webfetch.js";
import type { ResolvedConfig } from "../../src/types.js";

const baseConfig: ResolvedConfig = {
	disabledTools: new Set(),
	useRestForExa: true,
	mcpTimeoutMs: 5000,
	ssrf: { allowRanges: [] },
	urlRewrites: [],
};

describe("web_fetch tool", () => {
	it("has a scoped definition and parameters", () => {
		const appendEntry = vi.fn();
		const tool = createWebFetchTool({ appendEntry } as never, baseConfig);
		expect(tool.name).toBe("web_fetch");
		expect(tool.parameters).toBeDefined();
		expect(tool.description).toContain("specific public URL");
		expect(tool.description).toContain("Do not use for greetings");
	});

	it("does not advertise get_fetch_content when it is disabled", () => {
		const tool = createWebFetchTool({ appendEntry: vi.fn() } as never, {
			...baseConfig,
			disabledTools: new Set(["get_fetch_content"]),
		});
		expect(tool.description).not.toContain("get_fetch_content");
	});

	it("returns fetch_blocked for localhost", async () => {
		const tool = createWebFetchTool({ appendEntry: vi.fn() } as never, baseConfig);
		const result = await tool.execute("id", { url: "http://127.0.0.1/secret" }, undefined);
		const err = result.details?.error as { message?: string; code?: string } | undefined;
		expect(err?.code).toBe("fetch_blocked");
		expect(err?.message).toMatch(/SSRF/i);
	});

	it("fetches HTML via mocked resolve pipeline", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				status: 200,
				headers: { get: () => "text/html" },
				text: async () => `<html><head><title>Hi</title></head><body><p>${"content ".repeat(80)}</p></body></html>`,
			})),
		);

		const appendEntry = vi.fn();
		const tool = createWebFetchTool({ appendEntry } as never, baseConfig);
		const result = await tool.execute("id", { url: "https://example.com/page" }, undefined);
		expect(appendEntry).toHaveBeenCalledWith(
			"pi-search-fetch-content",
			expect.objectContaining({ url: "https://example.com/page" }),
		);
		expect(result.content[0]?.text).toMatch(/content/);
		expect(result.details?.extraction).toBeDefined();
		expect(result.details?.fetchId).toBeDefined();

		vi.unstubAllGlobals();
	});

	it("does not reference disabled get_fetch_content in truncated output", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				status: 200,
				headers: { get: () => "text/html" },
				text: async () => `<html><body><p>${"content ".repeat(1000)}</p></body></html>`,
			})),
		);

		const tool = createWebFetchTool({ appendEntry: vi.fn() } as never, {
			...baseConfig,
			disabledTools: new Set(["get_fetch_content"]),
		});
		const result = await tool.execute("id", { url: "https://example.com/page", maxOutputChars: 1000 }, undefined);
		expect(result.content[0]?.text).not.toContain("get_fetch_content");
		expect(result.content[0]?.text).toContain("chars total]");

		vi.unstubAllGlobals();
	});
});
