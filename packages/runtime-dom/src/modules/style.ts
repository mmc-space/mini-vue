export function patchStyle(el: any, prevValue: any, nextValue: any) {
  // 样式需要比对差异
  for (let key in nextValue) {
    // 用新的直接覆盖
    el.style[key] = nextValue[key]
  }

  // 去除之前的样式
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] === null) {
        el.style[key] = null
      }
    }
  }
}