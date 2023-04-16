import { Target, reactive } from "./reactive"
import { track, trigger } from "./effect"
import { isObject } from "@vue/shared"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // activeEffect 和 key 关联在一起
    track(target, 'get', key)

    const res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  set(target: Target, key: string | symbol, value: unknown, receiver: object) {
    let oldValue = (target as any)[key]
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) { // 值变化了
      // 需要更新
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}
