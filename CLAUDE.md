# Writing App — Project Brief

A minimalist desktop writing tool. Personal, local-first, distraction-free.

## What this is
A personal writing space for mini essays and articles. The homepage lists all pieces; clicking one opens a full-screen canvas editor. No accounts, no sync, no clutter. Writing is the only focus.

## Stack
- **Tauri v2** — Rust backend, handles filesystem access and native window
- **React + TypeScript** — frontend UI
- **TipTap** — rich text editor (ProseMirror-based), handles markdown-like editing
- **TailwindCSS** — styling
- **Local filesystem** — pieces stored as `.json` files in the app's data directory via Tauri's fs API

## Project Structure
```
src/
  components/
    Editor/         # TipTap canvas and toolbar
    Home/           # Piece list and new piece button
  lib/
    storage.ts      # All filesystem read/write logic
    types.ts        # Shared TypeScript types
  App.tsx           # Routing between Home and Canvas
src-tauri/
  tauri.conf.json   # Tauri config — filesystem permissions live here
```

## Data Model
Each piece is a `.json` file stored in the app's local data directory:
```ts
interface Piece {
  id: string;           // nanoid, used as filename
  title: string;        // derived from first heading or "Untitled"
  content: JSONContent; // TipTap document JSON
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
  wordCount: number;
}
```
## Groups Feature
Pieces can belong to a group (optional). Groups have a name and a color.
Groups are stored in a separate `groups.json` file in the pieces directory.
Each piece stores a `groupId` (string | null) referencing a group.

Group data shape:
{
  id: string
  name: string
  color: string  // hex value
}

groups.json shape:
{
  groups: Group[]
}

## Storage Layer (src/lib/storage.ts)
All filesystem operations go through these functions using Tauri's `@tauri-apps/plugin-fs` API:
- `savePiece(piece: Piece): Promise<void>`
- `loadPiece(id: string): Promise<Piece>`
- `listPieces(): Promise<PieceMeta[]>` — returns metadata only (no content), sorted by updatedAt desc
- `deletePiece(id: string): Promise<void>`

Pieces are stored at: `{appLocalDataDir}/pieces/{id}.json`

## Editor (src/components/Editor/)
- Full-screen TipTap canvas — feels like paper, no visible borders or sidebars
- Toolbar: Bold, Italic, Heading (H1, H2), Link, Image, Blockquote, Horizontal Rule
- Word + character counter fixed in the bottom-right corner
- Auto-saves on every content change (debounced 800ms)
- Title is derived from the first H1 in the document; falls back to "Untitled"

## Home Page (src/components/Home/)
- Clean list of all pieces: title, last edited date, word count
- "New piece" button creates a new piece and navigates to the canvas
- Click any piece to open it in the canvas

## Design Principles
- **Minimal chrome** — the writing surface should feel like paper
- **No modals, no sidebars, no settings panes** (for now)
- **Typography-first** — generous line-height, comfortable reading width (~680px max), good font choice
- Color palette: near-white background, near-black text, one subtle accent for interactive states

## TipTap Extensions in Use
```ts
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Typography from '@tiptap/extension-typography'
```
Blockquote and Heading are included in StarterKit.

## Tauri Permissions
The app requires filesystem read/write access. In `src-tauri/capabilities/default.json`, ensure these permissions are included:
- `fs:allow-read-file`
- `fs:allow-write-file`
- `fs:allow-read-dir`
- `fs:allow-create-dir`
- `fs:allow-remove-file`
- `path:allow-app-local-data-dir`

## Routing
Using simple React state for navigation (no react-router needed at this scale):
- `view: 'home'` → renders Home
- `view: 'editor', pieceId: string | null` → renders Editor (null = new piece)

## Current Status
- [ ] Project scaffolded (Tauri + React + TS)
- [ ] Dependencies installed
- [ ] Storage layer implemented
- [ ] TipTap canvas with toolbar
- [ ] Word/character counter
- [ ] Home page with piece list
- [ ] Auto-save
- [ ] Navigation between views
- [ ] Polish pass (typography, spacing, transitions)

## What We're NOT Building (yet)
- Tags or folders
- Search
- Export (PDF, markdown)
- Themes / dark mode
- Mobile
- Any kind of sync or cloud storage
