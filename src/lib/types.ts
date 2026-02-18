import { JSONContent } from '@tiptap/react'

export interface Piece {
  id: string
  title: string
  content: JSONContent
  createdAt: string
  updatedAt: string
  wordCount: number
  archived?: boolean
}

export type PieceMeta = Omit<Piece, 'content'>

export type AppView =
  | { view: 'home' }
  | { view: 'archive' }
  | { view: 'editor'; pieceId: string | null; returnTo?: 'home' | 'archive' }
