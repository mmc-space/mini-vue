import { isObject } from "@vue/shared"
import { reactive } from './reactive'
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