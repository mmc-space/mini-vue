import { isObject } from "@vue/shared"
import { ReactiveFlags } from "./baseHandlers"
import { mutableHandlers } from "./baseHandlers"

const reactiveMap = new WeakMap()
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

// 判断是否是响应式
export function isReactive(value: any) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function reactive<T extends object>(target: T): any
export function reactive(target: Target) {
  if (!isObject(target)) {
    return target
  }

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  let exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }

  let proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)

  return proxy
}