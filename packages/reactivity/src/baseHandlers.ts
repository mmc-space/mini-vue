import { ReactiveFlags, Target } from './reactive'


export const mutableHandlers = {
  get(target: Target, key: string | symbol, receiver: object) {
    // Reflect 会把目标对象中的this换成代理对象
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    return Reflect.get(target, key, receiver)
  },
  set(target: object, key: string | symbol, value: unknown, receiver: object) { 
    return Reflect.set(target, key, value, receiver)
  }
}