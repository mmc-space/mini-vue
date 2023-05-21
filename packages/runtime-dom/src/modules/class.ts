
export function patchClass(el: any, nextValue: any) {
  if (nextValue === null) {
    el.removeAttribute('class') // 如果传来的值空 那么这里就是移除
  } else {
    el.className = nextValue
  }
}
