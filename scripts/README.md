# How this page is drawn

The profile README uses no third-party widgets.
Every image is an SVG file, drawn by the small Node script in this folder.

## Change the words

1. Open `profile.config.mjs` in the root folder.
2. Edit the text: the headline, the six layers, the projects, the links.
3. Run `npm run build`.
4. Commit and push.

You can also push only the config file.
The workflow then redraws the images for you.

Do not edit `README.md` or the files in `assets/` by hand.
The next build writes over them.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Installs the tools. Needs Node.js 20 or newer. |
| `npm run fetch` | Reads the public numbers from GitHub into `data/github.json`. It also checks that every live demo link still answers. |
| `npm run build` | Draws the images into `assets/` and writes `README.md`. |
| `npm run check` | Checks the images and the README. It fails when something is broken. |
| `npm run refresh` | Runs the three steps above, in order. |

`npm run fetch` needs a GitHub token.
It reads `GH_TOKEN` or `GITHUB_TOKEN`.
On your own PC it falls back to `gh auth token`.
It only asks for public data.

## Files

| Path | What it holds |
| --- | --- |
| `profile.config.mjs` | The words. This is the file to edit. |
| `data/github.json` | The numbers, saved by `npm run fetch`. |
| `assets/` | The images, one dark and one light file each. |
| `scripts/build.mjs` | Draws every image and writes the README. |
| `scripts/fetch-data.mjs` | Fetches the numbers and checks the demo links. |
| `scripts/check.mjs` | Checks the result. |
| `scripts/lib/doc.mjs` | The text engine. It turns text into outlines. |
| `scripts/lib/theme.mjs` | Colours and sizes for both themes. |
| `scripts/lib/iso.mjs` | The plates of the stack and the drawings on them. |
| `scripts/lib/hero.mjs` | The top image. |
| `scripts/lib/tile.mjs` | The six layer tiles. |
| `scripts/lib/cards.mjs` | The project cards. |
| `scripts/lib/vignettes.mjs` | The small animated drawings on the cards. |
| `scripts/lib/activity.mjs` | The two cards with live numbers. |
| `scripts/lib/readme.mjs` | The layout of `README.md`. |

## How the images work

- **Text is drawn as outlines.**
  An image inside a README cannot load a web font.
  So each letter is stored once as a shape and reused.
  The page looks the same in every browser.
- **Two themes.**
  Every image has a dark and a light file.
  GitHub picks one with the `<picture>` tag.
  The backgrounds are transparent, so the images sit well on any GitHub theme.
- **One column.**
  A profile README is 846 pixels wide on a large screen, and about 830 on a laptop that shows a scrollbar.
  The page is one column of 824 pixels, so it fits both.
  Tiles are 272 pixels wide and cards are 410 pixels wide.
  Three tiles or two cards fill one row.
  On a phone they stack, and the text stays readable.
- **The top is two images.**
  The headline is one image and the stack is another.
  They meet edge to edge on a wide screen and stack on a phone.
- **Motion is plain CSS inside the SVG.**
  There is no script.
  People who ask their system for reduced motion get still images.
- **Motion is kept cheap.**
  A browser redraws a whole image each time something in it changes.
  So only the stack moves smoothly, and it is a small image.
  The tiles move once, when they first show.
  The small drawings on the cards change about once a second.
  Measured in a test browser, the page uses about one fifth of the processor time of the first version.
- **A LIVE badge means live.**
  The fetch step opens each demo link.
  A link that answers "not found" loses its badge until it is back.

## The daily refresh

`.github/workflows/refresh.yml` runs once a day.
It also runs when the config or the scripts change, and when you start it by hand.
It fetches the numbers, draws the images, checks them, and commits only when something changed.

## Fonts

The outlines come from three open fonts.
They are Inter Tight, Instrument Serif and JetBrains Mono, all under the SIL Open Font License.
The font files are not stored in this repository.
They come from npm when the build runs.
