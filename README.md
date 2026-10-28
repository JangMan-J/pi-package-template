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

   `init-package` sets the npm name (default: the repository name), `repository`,
   `homepage`, `bugs`, the lockfile name, and this title. npm provenance fails when
   `repository` does not match the repository that publishes.
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

Requires Node.js 22.19 or later. Pi and `typebox` are peer dependencies with exact dev
pins, so the tests run against one known Pi. CI also tests the lowest Pi the
`@earendil-works/pi-coding-agent` peer range allows.

```sh
npm run check        # type checker and tests
npm run smoke:pack   # pack, install the tarball, and load it in Pi
```

## License

MIT. See `LICENSE`.
