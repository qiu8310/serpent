import { useEffect } from 'react'

/**
 * 给 html 添加 className
 * @param className 单个或多个 class 拼接而成的字符串
 */
export function useRootClassName(className: string) {
  useEffect(() => {
    const old = document.documentElement.className
    const list = [old, className].filter(s => !!s)
    document.documentElement.className = list.join(' ')
    return () => {
      document.documentElement.className = old
    }
  }, [className])
}
