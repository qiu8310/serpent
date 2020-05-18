import { useEffect } from 'react'

/**
 * 给指定的 DOM 添加 className
 * @param className 单个或多个 class 拼接而成的字符串
 */
export function useClassName(element: Element, className: string) {
  useEffect(() => {
    const old = element.className
    const wrappedOld = wrap(old)

    if (className && !wrappedOld.includes(wrap(className))) {
      element.className = wrappedOld + ' ' + className

      return () => {
        element.className = old
      }
    }

    return
  }, [className])
}

/**
 * 给 body 添加 className
 * @param className 单个或多个 class 拼接而成的字符串
 */
export function useBodyClassName(className: string) {
  return useClassName(document.body, className)
}

/**
 * 给 html 添加 className
 * @param className 单个或多个 class 拼接而成的字符串
 */
export function useHtmlClassName(className: string) {
  return useClassName(document.documentElement, className)
}

function wrap(str: string) {
  return str ? ' ' + str + ' ' : ''
}
