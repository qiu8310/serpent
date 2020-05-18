import { useState, useEffect } from 'react'
import { useLocalStorage } from 'react-use'

export function usePersistState(persistKey: string, initialState?: any) {
  const [storeValue, setStoreValue, removeStoreValue] = useLocalStorage(persistKey, initialState)

  const [value, setValue] = useState(() => {
    return typeof storeValue !== 'undefined' ? storeValue : initialState
  })

  useEffect(() => {
    if (value === undefined) {
      removeStoreValue()
    } else {
      setStoreValue(value)
    }
  }, [value])

  return [value, setValue, removeStoreValue]
}
