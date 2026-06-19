/**
 * Business hours utility for Vietnam timezone (UTC+7)
 * Operating hours: 06:00 - 22:00
 */

import { useState, useEffect } from 'react'

const OPEN_HOUR = 6
const CLOSE_HOUR = 22

export function getVietnamHour(): number {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const vnTime = new Date(utcMs + 7 * 3600000)
  return vnTime.getHours()
}

export function isBusinessOpen(): boolean {
  const hour = getVietnamHour()
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR
}

/**
 * Reactive hook: tự cập nhật khi đồng hồ chuyển qua khung giờ
 * Dùng cho UI hiển thị trạng thái mở/đóng realtime
 */
export function useIsBusinessOpen(): boolean {
  const [open, setOpen] = useState(isBusinessOpen())

  useEffect(() => {
    // Kiểm tra mỗi phút
    const interval = setInterval(() => {
      setOpen(isBusinessOpen())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return open
}

export const BUSINESS_HOURS_TEXT = '6:00 AM - 10:00 PM'
export const BUSINESS_HOURS_DETAIL = 'Monday - Sunday | 6:00 AM to 10:00 PM'
