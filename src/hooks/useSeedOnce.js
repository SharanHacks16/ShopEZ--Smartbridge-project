import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { seedDemoUsers } from '../utils/seed'

let seeded = false

export function useSeedOnce() {
  useEffect(() => {
    if (seeded) return
    seeded = true
    ;(async () => {
      try {
        const { data } = await supabase.from('profiles').select('id').limit(1)
        if (!data || data.length === 0) {
          await seedDemoUsers()
        }
      } catch {
        // silently ignore seed errors
      }
    })()
  }, [])
}
