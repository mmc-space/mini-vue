import { isArray, isObject } from "@vue/shared"
import { isReactive, reactive } from './reactive'
import { trackEffect, triggerEffect } from "./effect"

function toReactive<T extends object>(value: T): T {
  return isObject(value) ? reactive(value) : value
}

class RefImpl<T extends object> {
  public dep = new Set
  public rawValue: T
  public _value
  public __v_isRef = true
  constructor(value: T) {
    this.rawValue = value
    this._value = toReactive(value)
  }

  get value() {
    trackEffect(this.dep)
    return this._value
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffect(this.dep)
    }
  }
}

export function ref<T extends object>(value: T) {
  return new RefImpl(value)
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  constructor(public object: T, public key: K) {
    this.object = object
    this.key = key
  }
  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef<T extends object, K extends keyof T>(object: T, key: K) {
  // const val = object[key]
  return (new ObjectRefImpl(object, key) as any)
  // return isRef(val)
  //   ? val
  //   : (new ObjectRefImpl(object, key) as any)
}

export function toRefs<T extends object>(object: T) {
  const result: any = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    result[key] = toRef(object, key)
  }
  return result
}

export function proxyRefs<T extends object>(object: T) {
  return new Proxy(object, {
    get: (target, key, recevier) => {
      let r = Reflect.get(target, key, recevier)
      return r.__v_isRef ? r.value : r
    },
    set: (target: any, key: any, value: any, recevier: any) => {
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
