import { JSONContent } from '@tiptap/react'

export interface Group {
  id: string
  name: string
  color: string
}

export interface Piece {
  id: string
  title: string
  content: JSONContent
  createdAt: string
  updatedAt: string
  wordCount: number
  archived?: boolean
  groupId: string | null
}

export type PieceMeta = Omit<Piece, 'content'>

export type AppView =
  | { view: 'home' }
  | { view: 'archive' }
  | { view: 'settings' }
  | { view: 'editor'; pieceId: string | null; returnTo?: 'home' | 'archive' }
