'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface BarCtx {
  barVisible: boolean
  dismiss: () => void
}

const Ctx = createContext<BarCtx>({ barVisible: true, dismiss: () => {} })

export function BarProvider({ children }: { children: React.ReactNode }) {
  const [barVisible, setBarVisible] = useState(true)

  const dismiss = useCallback(() => setBarVisible(false), [])

  // Sync --bar-h CSS variable on <html> so nav top tracks bar height
  useEffect(() => {
    document.documentElement.style.setProperty('--bar-h', barVisible ? '38px' : '0px')
  }, [barVisible])

  return <Ctx.Provider value={{ barVisible, dismiss }}>{children}</Ctx.Provider>
}

export function useBar() {
  return useContext(Ctx)
}
