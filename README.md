# Listen Notes Dispatch

This standalone microfeed theme repository was exported from the exact
installed package `local.legacy-theme@1.0.2`. Its package identity is now
`listennotes.dispatch`. Version `1.1.0` restores the shared
site header, adds a local Tailwind CSS build, and uses theme format v2 for
microfeed's built-in search dialog and Page/Search templates.

The installed package includes all layout CSS inline. It does not load Tailwind
from a CDN or compile styles in a visitor's browser. Images and subscription
links still come from the site's feed and existing content URLs.

## Develop

Use Node.js 22.12 or newer and Yarn 4:

```console
yarn install
yarn build
yarn validate
yarn test
yarn preview
```

The committed `yarn.lock` keeps this directory independent from any parent
workspace and pins its development tools. Use `yarn install --immutable` in CI.

Edit `src/styles.css` for Tailwind imports, brand colors, and rich-text styles,
and `src/web-header.mustache` for the `<head>` wrapper. Feed and item layouts
live in `src/web-feed.mustache` and `src/web-item.mustache`.
The night-mode toggle lives in `src/theme.js` and is embedded in the generated
header before styles load, so the selected color scheme applies immediately.

Edit **`src/partials/project-list.mustache`** to update the project sidebar.
This is the single shared list for feed and item pages, including CurateKit.
The build inserts it at each layout's `<!-- PROJECT_LIST -->` marker before
installation; microfeed does not need runtime partial support.

`yarn build` scans the source templates and other editable Mustache slots,
compiles Tailwind utilities, and generates `web-header.mustache`,
`web-feed.mustache`, and `web-item.mustache`. Never edit those generated files
directly. Include them in theme commits: microfeed installs rendered files and
does not run the build. `.build/` is ignored scratch output.

`yarn check:build` rejects stale generated templates and CSS without rewriting
the installed files. Both validation and tests run this check. `yarn preview` rebuilds
before starting; restart the preview command after editing because the preview
server loads the theme and feed once at startup.

When the manifest declares a `previewFixture`, `yarn preview` uses that
theme-specific demo content by default. To preview against a public microfeed
JSON Feed instead:

```console
yarn preview --feed-url https://changelog.listennotes.com/json/
```

The search icon beside ListenNotes.com opens microfeed's search dialog;
Command/Ctrl+K also opens it. Search behavior belongs to microfeed, and the
theme supplies its trigger, brand colors, and `/search/` page layout. Local
preview filters representative fixture results; live search runs after the
theme is installed and activated on the site.

The night-mode button beside search follows the system color scheme initially
and remembers a visitor's explicit choice in local storage. Sandboxed previews
block storage, so their toggle works for the current page but resets on reload.

Item-description images open in a full-screen preview with Download and Close
controls. Escape closes the preview and returns focus to the image link. Direct
downloads require the image host to allow cross-origin requests; otherwise the
preview offers an Open full image link for saving through the browser. The
standard theme-kit preview sandbox disables downloads. Description content has
150px of bottom padding before the next section or footer.

Read [THEME.md](./THEME.md), `microfeed-theme.json`, and the schemas under
`.microfeed/schemas/` before editing. Establish a clean validation and test
baseline before committing.

Coding-agent workflows remain canonical under `.agents/skills/`.
`CLAUDE.md` directs Claude Code to the same theme-development skill without
duplicating it.

If this directory is not already a Git repository, initialize it after those
checks pass:

```console
git init --initial-branch main
```

Before installing changed content, increment the semantic version in
`microfeed-theme.json`. Install the new version as inactive, preview it, and
activate it only as a separate confirmed action.

## Install on the changelog site

This repository is private, so install from the validated local checkout after
committing and pushing. microfeed's GitHub installer supports public repositories
only. From this directory:

```console
yarn build
yarn validate
yarn test
npx @microfeed/cli manage theme install . --instance listen-notes-changelog --json
npx @microfeed/cli manage theme list --instance listen-notes-changelog --json
```

Installation creates an inactive immutable version. Review it in the site's
**Settings → Themes** before activating it separately.
