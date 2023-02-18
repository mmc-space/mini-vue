import { ReactiveFlags, Target, toRaw } from './reactive'
import { track, trigger } from './effect'

export const mutableHandlers = {
  get(target: Target, key: string | symbol, receiver: object) {
    // Reflect 会把目标对象中的this换成代理对象
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)
    return Reflect.get(target, key, receiver)
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