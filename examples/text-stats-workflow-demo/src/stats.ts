export interface TextStatistics {
  lines: number
  words: number
  characters: number
}

/** Count logical lines, whitespace-delimited words, and Unicode code points. */
export function countText(text: string): TextStatistics {
  return {
    lines: countLines(text),
    words: text.trim().length === 0 ? 0 : text.trim().split(/\s+/u).length,
    characters: Array.from(text).length,
  }
}

function countLines(text: string): number {
  if (text.length === 0) return 0
  const lines = text.split(/\r\n|\n/u)
  if (lines.at(-1) === '') lines.pop()
  return lines.length
}