import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

/** The installed Pi package directory, found from its entry point. */
function piDir(): string {
  let dir = dirname(fileURLToPath(import.meta.resolve("@earendil-works/pi-coding-agent")));
  for (;;) {
    try {
      if (JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name === "@earendil-works/pi-coding-agent") return dir;
    } catch { /* not the package root yet */ }
    if (dirname(dir) === dir) throw new Error("Cannot find the installed @earendil-works/pi-coding-agent");
    dir = dirname(dir);
  }
}

/** Load the extension through Pi's real loader, as an installed package is loaded. */
async function load() {
  const { loadExtensions, createExtensionRuntime } = await import(pathToFileURL(join(piDir(), "dist/core/extensions/loader.js")).href);
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const runtime = createExtensionRuntime();
  const loaded = await loadExtensions(manifest.pi.extensions.map((entry: string) => resolve(root, entry)), root, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  return loaded.extensions[0];
}

test("Pi loads the extension and registers its tool", async () => {
  const extension = await load();
  assert.deepEqual([...extension.tools.keys()], ["hello"]);
});

test("the tool answers", async () => {
  const extension = await load();
  const tool = extension.tools.get("hello").definition;
  const result = await tool.execute("call-1", { name: "Pi" }, undefined, undefined, undefined);
  assert.equal(result.content[0].text, "Hello, Pi.");
});
