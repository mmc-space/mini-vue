import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'
// 1. 将数据转换成响应式数据
// 2.代理过的对象将不进行代理
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  RAW = '__v_raw'
}
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.RAW]?: any
}

const reactiveMap = new WeakMap<Target, any>()

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
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

// const target = {
//   name: 'aaa',
//   get alise() {
//     return this.name
//   }
// }

// const proxy = new Proxy(target, {
//   get(target, key, receiver) {
//     // Reflect 会把目标对象中的this换成代理对象
//     console.log(key)
    
//     // return target[key]
//     return Reflect.get(target, key, receiver)
//   },
//   set(target, key, value, receiver) {
//     return Reflect.set(target, key, value, receiver)
//   }
// })

// proxy.alise

/**
 * 问题1 
 * 有一个对象为
 * const target = {
 *   name: 'gdy',
 *   get alias() {
 *     return this.name
 *   }
 * }
 * 
 * 如果使用 proxy.alias, 在proxy的get 中打印key 可以看到 只有一个alise
 * 这样是错误的，因为target的alise 读取了name， name 也要被代理或者说收集
 * 这两个在reactive中都要监测到
 * 
 * 所以就要用到Reflect 来将目标对象中的this 改成代理对象
 * 这样一来 alise 中的retrun this 是代理对象了，.name 后也就执行了 proxy 中的get 
 * 然后在控制台中打印 key 就可以看到 一个alise 和一个 name

 */