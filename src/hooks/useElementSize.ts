import { useLayoutEffect, useRef, useState } from 'react'

export interface Size {
  width: number
  height: number
}

/**
 * Observed size of an element. Used to solve camera framing against the real
 * canvas aspect ratio rather than guessing per breakpoint.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setSize((current) =>
        Math.abs(current.width - box.width) < 1 && Math.abs(current.height - box.height) < 1
          ? current
          : { width: box.width, height: box.height },
      )
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
