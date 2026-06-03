import { useEffect, useState } from 'react'
import type { DashboardData } from '../../../shared/types'

type Status = 'loading' | 'ready' | 'error'
type Setter = (fn: (d: DashboardData | null) => DashboardData | null) => void

export function useDashboard(): { data: DashboardData | null; status: Status; setData: Setter } {
  const [data, setData] = useState<DashboardData | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!window.api) {
      console.error('window.api is undefined — preload may have failed')
      setStatus('error')
      return
    }
    window.api.getDashboard()
      .then((d) => { setData(d); setStatus('ready') })
      .catch((err) => { console.error('getDashboard failed:', err); setStatus('error') })
  }, [])

  return { data, status, setData }
}
