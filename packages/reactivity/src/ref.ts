import { isObject } from '@vue/shared'
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
