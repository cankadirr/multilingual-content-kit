import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createContentClient } from "../src/client.js";
import { strapiEnvelope, trArticle } from "./fixtures.js";

function fakeFetch(respond: (url: string, init?: RequestInit) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => respond(String(input), init)) as typeof fetch;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("createContentClient", () => {
  it("returns a parsed article and sends the token", async () => {
    let seenUrl = "";
    let seenAuth: string | null = null;
    const client = createContentClient({
      baseUrl: "https://cms.example.com/",
      token: "test-token",
      fetch: fakeFetch((url, init) => {
        seenUrl = url;
        seenAuth = new Headers(init?.headers).get("authorization");
        return json(strapiEnvelope([trArticle]));
      }),
    });

    const result = await client.articleBySlug("nehrin-iki-yakasi", "tr");
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.value?.documentId, "doc1");
    assert.match(seenUrl, /^https:\/\/cms\.example\.com\/api\/articles\?/);
    assert.match(decodeURIComponent(seenUrl), /filters\[slug\]\[\$eq\]=nehrin-iki-yakasi/);
    assert.equal(seenAuth, "Bearer test-token");
  });

  it("returns null when no article matches", async () => {
    const client = createContentClient({ baseUrl: "https://cms.example.com", fetch: fakeFetch(() => json(strapiEnvelope([]))) });
    const result = await client.articleBySlug("missing", "tr");
    assert.deepEqual(result, { ok: true, value: null });
  });

  it("reports schema problems with their paths instead of throwing", async () => {
    const broken = { ...trArticle, slug: "Not A Slug", documentId: undefined };
    const client = createContentClient({ baseUrl: "https://cms.example.com", fetch: fakeFetch(() => json(strapiEnvelope([broken]))) });
    const result = await client.articleBySlug("x", "tr");
    assert.equal(result.ok, false);
    if (result.ok || result.error.kind !== "validation") throw new Error("expected a validation error");
    assert.ok(result.error.issues.some((i) => i.startsWith("data.0.slug")));
    assert.ok(result.error.issues.some((i) => i.startsWith("data.0.documentId")));
  });

  it("maps HTTP, JSON and network failures to typed errors", async () => {
    const http = createContentClient({ baseUrl: "https://cms.example.com", fetch: fakeFetch(() => json({}, 503)) });
    assert.deepEqual(await http.articleBySlug("x", "tr"), { ok: false, error: { kind: "http", status: 503 } });

    const badJson = createContentClient({ baseUrl: "https://cms.example.com", fetch: fakeFetch(() => new Response("<html>")) });
    assert.deepEqual(await badJson.articleBySlug("x", "tr"), { ok: false, error: { kind: "invalid-json" } });

    const offline = createContentClient({
      baseUrl: "https://cms.example.com",
      fetch: fakeFetch(() => {
        throw new TypeError("fetch failed");
      }),
    });
    assert.deepEqual(await offline.articleBySlug("x", "tr"), { ok: false, error: { kind: "network", message: "fetch failed" } });
  });
});
