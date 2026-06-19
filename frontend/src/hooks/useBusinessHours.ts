/**
 * Hook kiểm tra giờ làm việc theo giờ Việt Nam (UTC+7)
 * Giờ hoạt động: 06:00 - 22:00
 */

const OPEN_HOUR = 6   // 6h sáng
const CLOSE_HOUR = 22 // 10h tối

export function getVietnamHour(): number {
  const now = new Date()
  // Lấy giờ Việt Nam (UTC+7)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const vnTime = new Date(utcMs + 7 * 3600000)
  return vnTime.getHours()
}

export function isBusinessOpen(): boolean {
  const hour = getVietnamHour()
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR
}

export const BUSINESS_HOURS_TEXT = '6:00 AM - 10:00 PM'
export const BUSINESS_HOURS_DETAIL = 'Monday - Sunday | 6:00 AM to 10:00 PM'
