import { ReactiveFlags, Target, reactive, toRaw } from './reactive'
import { track, trigger } from './effect'
import { isObject } from '@vue/shared'

export const mutableHandlers = {
  get(target: Target, key: string | symbol, receiver: object) {
    // Reflect 会把目标对象中的this换成代理对象
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)
    let res =  Reflect.get(target, key, receiver)
    if (isObject(res)) {
      return reactive(res) // 深度代理实现
    }
    return res
  },
  set(target: object, key: string | symbol, value: unknown, receiver: object) { 
    let oldValue = (target as any)[key]
    let result = Reflect.set(target, key, value, receiver)

    if (oldValue !== result) { // 值变化
      trigger(target, 'set', key, value, oldValue)
    }

    return result
  }
}