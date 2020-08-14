export function test() {
  var a = 123
  return a;
}

export function empty() {}

export interface Empty {}

declare namespace Foo {
  export function foo(s: string): void
  export function foo(n: number): void
  export function bar(): void
  export function foo(sn: string | number): void
}

const x: Array<string> = ['a', 'b']
const y: readonly string[] = ['a', 'b']
console.log(x, y)
