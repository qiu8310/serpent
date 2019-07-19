import { useEffect } from 'react'

/**
 * 给 body 添加 className
 * @param className 单个或多个 class 拼接而成的字符串
 */
export function useBodyClassName(className: string) {
  useEffect(() => {
    const old = document.body.className
    const list = [old, className].filter(s => !!s)
    document.body.className = list.join(' ')
    return () => {
      document.body.className = old
    }
  }, [className])
}
