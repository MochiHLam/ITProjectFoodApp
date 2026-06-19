/**
 * Middleware: chặn đặt hàng ngoài giờ làm việc (06:00 - 22:00 giờ Việt Nam UTC+7)
 */
function checkBusinessHours(req, res, next) {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const vnTime = new Date(utcMs + 7 * 3600000)
  const hour = vnTime.getHours()

  const OPEN_HOUR = 6
  const CLOSE_HOUR = 22

  if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
    return res.status(403).json({
      message: 'Orders are only accepted between 6:00 AM and 10:00 PM (Vietnam time)',
      code: 'OUTSIDE_BUSINESS_HOURS'
    })
  }
  next()
}

module.exports = { checkBusinessHours }
