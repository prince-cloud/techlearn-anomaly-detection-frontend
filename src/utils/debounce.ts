import { debounce, DebouncedFunc } from "lodash"
import { MutableRefObject, useEffect, useMemo, useRef } from "react"

interface CallbackRef extends MutableRefObject<() => void> {
  current: () => void
}

export const useDebounce = (callback: () => void): DebouncedFunc<() => void> => {
  const ref = useRef() as CallbackRef;

  useEffect(() => {
    ref.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }

    return debounce(func, 500)
  }, [])

  return debouncedCallback
}
