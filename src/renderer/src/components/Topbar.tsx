import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { WeatherData } from '../../../shared/types'

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad    = (n: number) => String(n).padStart(2, '0')

export default function Topbar({ weather }: { weather: WeatherData | null }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20_000)
    return () => clearInterval(id)
  }, [])

  const h    = now.getHours()
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
  const hour12 = h % 12 || 12
  const ampm   = h < 12 ? 'AM' : 'PM'

  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.2, 0.7, 0.3, 1] }}
    >
      <div>
        <div className="eyebrow">
          {DAYS[now.getDay()]} · {now.getDate()} {MONTHS[now.getMonth()]}
        </div>
        <div className="greeting">Good {part}, Will</div>
      </div>
      <div>
        <div className="clock">
          {hour12}:{pad(now.getMinutes())}<span className="ampm">{ampm}</span>
        </div>
        {weather ? (
          <div className="weather">
            <div className="sub-right weather-now">
              Evanston · {weather.temp}°
              <i className={`ti ${weather.icon}`} aria-hidden="true" />
              {weather.label}
            </div>
            <div className="weather-pop">
              <div className="wpop-head">
                Feels {weather.apparentTemp}° · {weather.humidity}% humidity · {weather.windSpeed} mph wind
              </div>
              <div className="wpop-hours">
                {weather.hourly.map((hr) => (
                  <div className="wpop-row" key={hr.time}>
                    <span className="wpop-time">{hr.time}</span>
                    <i className={`ti ${hr.icon}`} aria-hidden="true" />
                    <span className="wpop-temp">{hr.temp}°</span>
                    <span className="wpop-precip">{hr.precip > 0 ? `${hr.precip}%` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="sub-right">Evanston · weather unavailable</div>
        )}
      </div>
    </motion.header>
  )
}
