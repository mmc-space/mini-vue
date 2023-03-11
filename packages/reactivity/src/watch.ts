import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

// 考虑如果对象中有循环引用的问题
function traversal(value: any, set = new Set()) {
  // 终结条件，不是对象就不再递归了
  if (!isObject(value)) return value

  if (set.has(value)) {
    return value
  }

  set.add(value)
  for (let key in value) {
    traversal(value[key], set)
  }
  
  return value
}

export function watch(source: any, cd: any) {
  let getter: () => any
  if (isReactive(source)) {
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }
  let cleanup: any
  const onCleanup = (fn: () => any) => {
    cleanup = fn
  }

  let oldValue: any

  const job = () => {
    if (cleanup) cleanup()  // 下一次watch 开始触发上一次watch 的清理
    const newValue = effect.run()
    cd(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter!, job)
  
  oldValue =  effect.run() 
}

