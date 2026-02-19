import {
  readTextFile,
  writeTextFile,
  readDir,
  mkdir,
  remove,
  exists,
} from '@tauri-apps/plugin-fs'
import { appLocalDataDir, join } from '@tauri-apps/api/path'
import { Piece, PieceMeta, Group } from './types'

export async function getPiecesDir(): Promise<string> {
  const base = await appLocalDataDir()
  const dir = await join(base, 'pieces')
  const dirExists = await exists(dir)
  if (!dirExists) {
    await mkdir(dir, { recursive: true })
  }
  return dir
}

export async function savePiece(piece: Piece): Promise<void> {
  const dir = await getPiecesDir()
  const path = await join(dir, `${piece.id}.json`)
  await writeTextFile(path, JSON.stringify(piece))
}

export async function loadPiece(id: string): Promise<Piece> {
  const dir = await getPiecesDir()
  const path = await join(dir, `${id}.json`)
  const text = await readTextFile(path)
  const piece = JSON.parse(text) as Piece
  if (piece.groupId === undefined) piece.groupId = null
  return piece
}

export async function listPieces(includeArchived = false): Promise<PieceMeta[]> {
  const dir = await getPiecesDir()
  const entries = await readDir(dir)
  const metas: PieceMeta[] = []

  for (const entry of entries) {
    if (!entry.name?.endsWith('.json')) continue
    const path = await join(dir, entry.name)
    const text = await readTextFile(path)
    const piece = JSON.parse(text) as Piece
    // Filter out archived pieces unless includeArchived is true
    if (!includeArchived && piece.archived) continue
    // If includeArchived is true, only show archived pieces
    if (includeArchived && !piece.archived) continue
    const { content: _content, ...meta } = piece
    metas.push({ ...meta, groupId: meta.groupId ?? null })
  }

  return metas.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function deletePiece(id: string): Promise<void> {
  const dir = await getPiecesDir()
  const path = await join(dir, `${id}.json`)
  await remove(path)
}

export async function archivePiece(id: string): Promise<void> {
  const piece = await loadPiece(id)
  piece.archived = true
  await savePiece(piece)
}

export async function unarchivePiece(id: string): Promise<void> {
  const piece = await loadPiece(id)
  piece.archived = false
  await savePiece(piece)
}

// ── Groups ──────────────────────────────────────────────────────────────────

async function getGroupsPath(): Promise<string> {
  const base = await appLocalDataDir()
  return join(base, 'groups.json')
}

export async function loadGroups(): Promise<Group[]> {
  const path = await getGroupsPath()
  const fileExists = await exists(path)
  if (!fileExists) return []
  const text = await readTextFile(path)
  return JSON.parse(text) as Group[]
}

export async function saveGroups(groups: Group[]): Promise<void> {
  const path = await getGroupsPath()
  await writeTextFile(path, JSON.stringify(groups))
}

export async function createGroup(name: string, color: string): Promise<Group> {
  const groups = await loadGroups()
  const group: Group = { id: crypto.randomUUID(), name, color }
  groups.push(group)
  await saveGroups(groups)
  return group
}

export async function deleteGroup(id: string): Promise<void> {
  const groups = await loadGroups()
  await saveGroups(groups.filter((g) => g.id !== id))
  // Clear groupId on all pieces belonging to this group
  const dir = await getPiecesDir()
  const entries = await readDir(dir)
  for (const entry of entries) {
    if (!entry.name?.endsWith('.json')) continue
    const path = await join(dir, entry.name)
    const text = await readTextFile(path)
    const piece = JSON.parse(text) as Piece
    if (piece.groupId === id) {
      piece.groupId = null
      await writeTextFile(path, JSON.stringify(piece))
    }
  }
}

export async function updatePieceGroup(pieceId: string, groupId: string | null): Promise<void> {
  const piece = await loadPiece(pieceId)
  piece.groupId = groupId
  await savePiece(piece)
}
