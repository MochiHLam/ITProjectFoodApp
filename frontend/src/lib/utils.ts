/**
 * Phân tích chuỗi tag thô (hỗ trợ phân cách bằng dấu phẩy hoặc mảng JSON)
 * và merge với danh sách tag hiện có (không trùng lặp).
 */
export function parseTags(rawInput: string, existingTags: string[]): string[] {
  if (!rawInput) return existingTags
  const sanitized = rawInput
    .replace(/^\s*\[/, '')
    .replace(/\]\s*$/, '')
  const splitTags = sanitized
    .split(',')
    .map(t => t.replace(/^\s*"|\s*"$/g, '').replace(/^\s*'|\s*'$/g, ''))
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0)
  if (splitTags.length === 0) return existingTags
  return Array.from(new Set([...existingTags, ...splitTags]))
}
