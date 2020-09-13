export function regexpTrim(str: string, regexp: RegExp, callback: (...matches: string[]) => void) {
  if (regexp.test(str)) {
    callback(RegExp.$1, RegExp.$2, RegExp.$3)
    return str.replace(regexp, '')
  }

  return str
}

export function spiltTrim2array(str: string, split: RegExp | string = '|') {
  return str
    .split(split)
    .map(s => s.trim())
    .filter(s => !!s)
}
