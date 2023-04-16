import { isArray, isObject } from '@vue/shared'
import { reactive } from './reactive'
import { trackEffects, triggerEffects } from './effect'
// 变成响应式的
function toReactive(value: any) {
  return isObject(value) ? reactive(value) : value
}

class RefImp {
  public _value: any
  public dep: any = new Set()
  public __v_isRef = true
  constructor(public rewValue: any) {
    this._value = toReactive(rewValue)
  }

  get value() {
    // 获取值的时候 effect 与 key 关联
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue: any) {
    if (newValue !== this.rewValue) {
      this._value = toReactive(newValue)
      this.rewValue = newValue
      // 值变化 触发更新
      triggerEffects(this.dep)
    }
  }
}

export function ref(value: any) {
  return new RefImp(value)
}

class ObjectRefImpl {
  constructor(public object: any, public key: any) {}

  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(object: any, key: any) {
  return new ObjectRefImpl(object, key)
}

export function toRefs(object: any) {
  // 对象 or 数组
  const result: any = isArray(object) ? new Array(object.length) : {}
  
  for (const key in object) {
    result[key] = toRef(object, key)
  }

  return result
}

export function proxyRefs(object: any) {
  return new Proxy(object, {
    get(target, key, recevier) {
      let r = Reflect.get(target, key, recevier)
      // 判断r 是否是ref
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, recevier) {
      let oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, recevier)
      }
    }
  })
}