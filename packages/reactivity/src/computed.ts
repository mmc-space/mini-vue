import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffect, triggerEffect } from "./effect";

class ComputedRefImpl {
  public effect: ReactiveEffect
  public _dirty = true // 默认取值的时候进行计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value: any
  public dep = new Set
  constructor(public getter: any, public setter: any) {
    this.effect =  new ReactiveEffect(getter, () => {
      // 稍后依赖的属性变化会执行此调度函数
      if (!this._dirty) {
        this._dirty = true
        // 实现一个触发更新
        triggerEffect(this.dep)
      }
    })
  }

  get value() {
    // 做依赖收集
    trackEffect(this.dep)
    if(this._dirty) { // 说明这个值是脏的
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(
  getterOrDebugOptions: any
): any {
  let onlyGetter = isFunction(getterOrDebugOptions)
  let getter
  let setter
  
  if (onlyGetter) {
    getter = getterOrDebugOptions
    setter = () =>  {console.warn('no set')}
  } else {
    getter = getterOrDebugOptions.get
    setter = getterOrDebugOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
