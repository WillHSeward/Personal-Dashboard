import { cacheGet, cacheGetStale, cacheSet } from '../cache'
import type { WeatherData, WeatherHour } from '../../shared/types'

// Open-Meteo is free and key-less. Coordinates are Evanston, Illinois.
const CACHE_KEY = 'weather:evanston'
const TTL = 15 * 60_000
const LAT = 42.0451
const LON = -87.6877

const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
  `&hourly=temperature_2m,weather_code,precipitation_probability` +
  `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=1`

// Maps a WMO weather code to a label + Tabler icon class.
function describe(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear', icon: 'ti-sun' }
  if (code === 1) return { label: 'Mainly clear', icon: 'ti-sun' }
  if (code === 2) return { label: 'Partly cloudy', icon: 'ti-cloud' }
  if (code === 3) return { label: 'Overcast', icon: 'ti-cloud' }
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'ti-cloud-fog' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'ti-cloud-rain' }
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'ti-cloud-rain' }
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'ti-cloud-snow' }
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: 'ti-cloud-rain' }
  if (code === 85 || code === 86) return { label: 'Snow showers', icon: 'ti-cloud-snow' }
  if (code >= 95) return { label: 'Thunderstorm', icon: 'ti-cloud-storm' }
  return { label: 'Unknown', icon: 'ti-cloud' }
}

function hourLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h} ${ampm}`
}

export async function getWeather(force = false): Promise<WeatherData | null> {
  if (!force) {
    const cached = cacheGet<WeatherData>(CACHE_KEY)
    if (cached) return cached
  }

  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) return cacheGetStale<WeatherData>(CACHE_KEY)

    const j = await res.json() as {
      current: {
        time: string
        temperature_2m: number
        apparent_temperature: number
        relative_humidity_2m: number
        weather_code: number
        wind_speed_10m: number
      }
      hourly: {
        time: string[]
        temperature_2m: number[]
        weather_code: number[]
        precipitation_probability: number[]
      }
    }

    // Keep only the hours from the current hour onward ("rest of the day").
    const start = new Date(j.current.time)
    start.setMinutes(0, 0, 0)
    const startMs = start.getTime()

    const hourly: WeatherHour[] = []
    for (let i = 0; i < j.hourly.time.length; i++) {
      if (new Date(j.hourly.time[i]).getTime() < startMs) continue
      const d = describe(j.hourly.weather_code[i])
      hourly.push({
        time: hourLabel(j.hourly.time[i]),
        temp: Math.round(j.hourly.temperature_2m[i]),
        label: d.label,
        icon: d.icon,
        precip: j.hourly.precipitation_probability[i] ?? 0,
      })
    }

    const cur = describe(j.current.weather_code)
    const data: WeatherData = {
      temp: Math.round(j.current.temperature_2m),
      apparentTemp: Math.round(j.current.apparent_temperature),
      label: cur.label,
      icon: cur.icon,
      humidity: j.current.relative_humidity_2m,
      windSpeed: Math.round(j.current.wind_speed_10m),
      hourly,
    }

    cacheSet(CACHE_KEY, data, TTL)
    return data
  } catch {
    return cacheGetStale<WeatherData>(CACHE_KEY)
  }
}
