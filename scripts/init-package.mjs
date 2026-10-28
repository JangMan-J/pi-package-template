#!/usr/bin/env node
// Point a repository created from the template at itself: package name, repository, homepage,
// bugs, lockfile name, and README title. npm provenance requires `repository` to match the
// GitHub repository that publishes, so run this before the first push.
//
//   npm run init-package -- [--name <npm-name>] [--description "<text>"]
//
// The GitHub owner and repository come from `git remote get-url origin`; the npm name
// defaults to the repository name.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const TEMPLATE = "pi-package-template";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({ options: { name: { type: "string" }, description: { type: "string" } } });

const origin = execFileSync("git", ["remote", "get-url", "origin"], { cwd: root, encoding: "utf8" }).trim();
const match = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/.exec(origin);
if (!match) throw new Error(`origin is not a GitHub repository: ${origin}`);
const [, owner, repo] = match;
if (repo === TEMPLATE) throw new Error("origin is the template itself; run this in a repository created from it");

const name = values.name ?? repo;
if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) throw new Error(`"${name}" is not a valid npm package name`);

const edit = (file, change) => {
  const path = join(root, file);
  const before = readFileSync(path, "utf8");
  const after = change(before);
  if (after !== before) writeFileSync(path, after);
  console.log(`${after === before ? "unchanged" : "updated  "} ${file}`);
};

edit("package.json", text => {
  const pkg = JSON.parse(text);
  pkg.name = name;
  if (values.description) pkg.description = values.description;
  pkg.repository = { type: "git", url: `git+https://github.com/${owner}/${repo}.git` };
  pkg.homepage = `https://github.com/${owner}/${repo}#readme`;
  pkg.bugs = { url: `https://github.com/${owner}/${repo}/issues` };
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

edit("package-lock.json", text => {
  const lock = JSON.parse(text);
  lock.name = name;
  if (lock.packages?.[""]) lock.packages[""].name = name;
  return `${JSON.stringify(lock, null, 2)}\n`;
});

edit("README.md", text => text.replace(/^# .*$/m, `# ${name}`));

edit("LICENSE", text => text.replace(/Copyright \(c\) \d{4}/, `Copyright (c) ${new Date().getFullYear()}`));

console.log(`\n${name} -> github.com/${owner}/${repo}. Next: write the extension, push, then npm run bootstrap:npm.`);
