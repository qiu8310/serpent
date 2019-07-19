import { useEffect } from 'react'

/**
 * 修改页面标题
 * @param title document title
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const old = document.title
    document.title = title
    return () => {
      document.title = old
    }
  }, [title])
}
