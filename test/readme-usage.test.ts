import assert from "node:assert/strict";
import { it } from "node:test";
import { createContentClient } from "../src/index.js";

it("accepts an optional token read from the environment", () => {
  const token: string | undefined = process.env["CMS_TOKEN_THAT_IS_NOT_SET"];
  const client = createContentClient({ baseUrl: "https://cms.example.com", token });
  assert.equal(typeof client.articleBySlug, "function");
});
