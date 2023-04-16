import { isFunction, isObject } from "@vue/shared"
import { ReactiveEffect } from "./effect"
import { isReactive } from "./reactive"

function traversal(value: any, set = new Set()) { // 如果对象中有循环引用的问题
  // 终结条件 不是对象就不递归了
  if (!isObject(value)) return value
  if (set.has(value)) return value
  set.add(value)
  for (const key in value) {
    traversal(value[key], set)
  }
  return value
}


/**
 * watch
 * @param source 传入的对象
 * @param cb 对应的回调
 */
export function watch(source: any, cb: any) {
  let getter
  if (isReactive(source)) {
    // 对用户传入的数据 进行递归循环（只要循环就会访问对象上的每一个属性，访问属性的时候会收集effect）
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }
  let cleanup: any
  const onCleanup = (fn: any) => {
    cleanup = fn // 保存用户传入的函数
  }
  let oldValue: any
  const job = () => {
    // 除第一次执行watch 其余watch执行的时候调用用户上一次保存的cleanup
    if (cleanup) {
      cleanup()
    }
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  // 在effect 中访问属性就会依赖收集
  const effect = new ReactiveEffect(getter, job) // 监控自己构造的函数，变化后重新执行job

  oldValue = effect.run()
}