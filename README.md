# pi-package-template

A template for Pi packages published to npm. It has CI, releases on a tag push through npm
trusted publishing with provenance, Dependabot, and a test that installs the packed tarball
and loads it in Pi.

## Start a new package

1. On GitHub, choose **Use this template** (or `gh repo create <name> --template JangMan-J/pi-package-template --public --clone`).
2. In the new clone:

   ```sh
   npm install
   npm run init-package -- --description "What the package does"
   npm run check
   ```

   The template carries no versions. `init-package` sets the npm name (default: the
   repository name), `repository`, `homepage`, `bugs`, and this title, then installs the
   current Pi and TypeScript. It installs `pi-ai` and `typebox` at the versions that Pi
   itself uses, and derives the floors from what it installed: the `pi-coding-agent` peer
   range and `engines.node`. npm provenance fails when `repository` does not match the
   repository that publishes. Commit the `package-lock.json` it creates; CI installs from
   it.
3. Write the extension in `src/`, update this README, and set the version you want to
   release first in `package.json`. Commit, push, and wait for CI to go green.
4. Run the one-time npm setup in an interactive terminal:

   ```sh
   npm login
   npm run bootstrap:npm -- --dry-run   # check everything, change nothing
   npm run bootstrap:npm
   ```

   The script creates the package on npm without publishing anything real, links the
   trusted publisher, and has CI publish the first version. You only enter 2FA codes. See
   the comment at the top of `scripts/npm-bootstrap.sh` for why it works this way.

## Release

```sh
npm version patch        # or minor / major: bumps package.json, commits, and tags vX.Y.Z
git push --follow-tags   # the tag runs .github/workflows/publish.yml
```

The publish workflow reruns CI, refuses a tag that does not match `package.json`,
publishes with provenance, and creates the GitHub release. A tag whose version is already
on npm skips the publish step, so rerunning a release is safe.

Optional hardening, once the first release is out: on npmjs.com, under the package's
**Settings > Publishing access**, choose *Require two-factor authentication and disallow
tokens*. CI still publishes through the trusted publisher.

## Development

The Pi core packages and `typebox` are peer dependencies, because Pi provides them at
runtime. Their exact dev pins make the tests run against what that Pi provides. CI reads
its floors from `package.json`: it tests the `engines.node` floor, the current LTS, and
the newest Node, plus the lowest Pi the peer range allows. Dependabot keeps the pins
current; `npm run init-package -- --refresh` moves them, and the floors, to today's
versions in one step. CI skips the template repository itself, which has no toolchain.

```sh
npm run check        # type checker and tests
npm run smoke:pack   # pack, install the tarball, and load it in Pi
```

## License

MIT. See `LICENSE`.
