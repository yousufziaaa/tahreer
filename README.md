# Tahreer

A minimalist, local-first desktop writing app for short-form essays and notes. تحرير means *writing* or *editing* in Arabic.

## What it does

Tahreer gives you a clean, distraction-free canvas to write in. Pieces are stored as JSON files on your machine — no accounts, no sync, no cloud.

- **Full-screen editor** with a separate title field and a rich-text TipTap body
- **Auto-save** — 800ms debounce on body edits, immediate on title blur
- **Groups** — color-coded labels for filtering pieces on the home screen; assign via right-click or the editor toolbar
- **Archive** — right-click any piece to archive or delete it; a separate Archive view holds everything you've put away
- **Settings** — choose from 8 theme presets and 19 curated fonts, with controls for editor font size and line width
- **Live clock** and **word/character counter** visible at all times while writing
- **Keyboard shortcuts** throughout

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + N` | New note (from home) |
| `Cmd + A` | Go to Archive (from home) |
| `Cmd + ,` | Open Settings |
| `Cmd + ←` | Go back (editor, archive, or settings → home) |
| `Cmd + Opt + T` | Toggle light/dark mode |

## Formatting

The toolbar (centered, always visible in the editor) covers:

`h1` `h2` `h3` `h4` — **Bold** — *Italic* — Link — Bullet list

## Themes

Eight presets: **Light**, **Dark**, **Sepia**, **Forest**, **Dusk**, **Nord**, **Graphite**, **Rose**. All colors are CSS custom properties applied to `:root` by `SettingsProvider` — no hard-coded values in component styles.

## Fonts

Nineteen curated Google Fonts across three categories (sans-serif, serif, monospace). The selected font is dynamically loaded via a `<link>` tag at runtime, so only the active font is ever fetched.

## Data

Each piece is a JSON file stored at:

- **macOS:** `~/Library/Application Support/com.yzia.tahreer/pieces/{id}.json`
- **Windows:** `%APPDATA%\com.yzia.tahreer\pieces\{id}.json`
- **Linux:** `~/.local/share/com.yzia.tahreer/pieces/{id}.json`

Groups are stored in a single `groups.json` file at the same root as the `pieces/` directory.

Schema:

```ts
interface Piece {
  id: string             // crypto.randomUUID()
  title: string
  content: JSONContent   // TipTap/ProseMirror document JSON
  createdAt: string      // ISO 8601
  updatedAt: string      // ISO 8601
  wordCount: number
  archived: boolean
  groupId: string | null
}

interface Group {
  id: string             // crypto.randomUUID()
  name: string
  color: string          // hex, randomly picked from a preset palette
}
```

## Tech stack

| Layer | Library |
|---|---|
| Desktop shell | [Tauri v2](https://tauri.app) (Rust) |
| UI | React 19 + TypeScript |
| Editor | [TipTap v3](https://tiptap.dev) (ProseMirror) |
| Filesystem | `@tauri-apps/plugin-fs` |
| Styling | Tailwind CSS v4 (reset/base) + plain CSS with custom properties |
| Bundler | Vite 7 |

## Project structure

```
src/
├── App.tsx                  # Root — navigation state (home | archive | settings | editor)
├── App.css                  # Global reset, Tailwind import, CSS variable defaults
├── lib/
│   ├── types.ts             # Piece, PieceMeta, Group, AppView
│   ├── storage.ts           # savePiece, loadPiece, listPieces, deletePiece,
│   │                        #   archivePiece, unarchivePiece, loadGroups,
│   │                        #   saveGroups, createGroup, deleteGroup, updatePieceGroup
│   ├── settings.ts          # THEMES, FONTS, AppSettings, loadSettings, saveSettings
│   └── SettingsProvider.tsx # Applies CSS vars + loads Google Font; exposes useSettings()
└── components/
    ├── Editor/              # Full-screen writing canvas + group selector in toolbar
    ├── Home/                # Piece list, group filter dropdown, context menu
    └── Settings/            # Theme swatches, font picker, font size + line width controls

src-tauri/
├── src/lib.rs               # Tauri builder — registers fs + opener plugins
├── tauri.conf.json          # App config (identifier: com.yzia.tahreer)
└── capabilities/default.json # Filesystem permissions (applocaldata read/write/meta)
```

## Development

Requires [Rust](https://rustup.rs) and [Node.js](https://nodejs.org).

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Produces a native installer in `src-tauri/target/release/bundle/`.
