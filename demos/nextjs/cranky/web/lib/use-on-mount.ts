import type { EffectCallback } from 'react'
import { useEffect, useRef } from 'react'

export function useOnMount(effect: EffectCallback) {
  const initialized = useRef(false)

  useEffect(
    () => {
      if (!initialized.current) {
        initialized.current = true
        effect()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
