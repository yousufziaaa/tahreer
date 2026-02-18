# Tahreer

A minimalist, local-first desktop writing app for short-form essays and notes. تحرير means *writing* or *editing* in Arabic.

## What it does

Tahreer gives you a clean, distraction-free canvas to write in. Pieces are stored as JSON files on your machine — no accounts, no sync, no cloud.

- **Full-screen editor** with a separate title field and a TipTap body
- **Auto-save** — 800ms debounce on body edits, immediate on title blur
- **Archive** — right-click any piece to archive or delete it; a separate Archive view holds everything you've put away
- **Dark mode** — follows system preference on first launch, then persisted to `localStorage`
- **Live clock** and **word/character counter** visible at all times while writing
- **Keyboard shortcuts** throughout

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + ←` | Go back (editor → home, archive → home) |
| `Cmd + Opt + T` | Toggle dark/light mode |

## Formatting

The toolbar (centered, always visible) covers:

`h1` `h2` `h3` `h4` — **Bold** — *Italic* — Link — Bullet list

Links and images are inserted via `window.prompt`.

## Data

Each piece is a JSON file stored at:

- **macOS:** `~/Library/Application Support/com.yzia.tahreer/pieces/{id}.json`
- **Windows:** `%APPDATA%\com.yzia.tahreer\pieces\{id}.json`
- **Linux:** `~/.local/share/com.yzia.tahreer/pieces/{id}.json`

Schema:

```ts
interface Piece {
  id: string            // crypto.randomUUID()
  title: string         // from the title field
  content: JSONContent  // TipTap/ProseMirror document JSON
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
  wordCount: number
  archived?: boolean
}
```

## Tech stack

| Layer | Library |
|---|---|
| Desktop shell | [Tauri v2](https://tauri.app) (Rust) |
| UI | React 19 + TypeScript |
| Editor | [TipTap v3](https://tiptap.dev) (ProseMirror) |
| Filesystem | `@tauri-apps/plugin-fs` |
| Styling | Tailwind CSS v4 + plain CSS |
| Font | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) |
| Bundler | Vite 7 |

## Project structure

```
src/
├── App.tsx                  # Root — navigation state (home | archive | editor)
├── App.css                  # Global reset, Tailwind import, fade animation
├── lib/
│   ├── types.ts             # Piece, PieceMeta, AppView
│   ├── storage.ts           # getPiecesDir, savePiece, loadPiece, listPieces,
│   │                        #   deletePiece, archivePiece, unarchivePiece
│   └── theme.tsx            # ThemeProvider + useTheme hook
└── components/
    ├── Editor/              # Full-screen writing canvas
    ├── Home/                # Piece list (also used for Archive view)
    ├── ThemeToggle/         # Sun/moon button (fixed, top-right)
    └── BackButton/          # ← button shown in Archive view

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
