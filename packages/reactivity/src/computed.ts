import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect"

class ComputedRefImpl {
  public effect
  public _dirty = true // 默认应该取值的时候进行计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value: any
  public dep: any = new Set()
  constructor(getter: any, public setter: any) {
    // getter 就是 effect 中的fn，也就是要执行的代码，需要放到effect
    // 在这里，fn 中的属性会被这个effect 收集起来
    this.effect = new ReactiveEffect(getter, () => {
      // 稍后这个依赖的属性变化会执行此调度函数 ??? 这里通知包裹computed 的effect 更新

      // 只有依赖的值变化了 才需要把_dirty 变为脏的
      if (!this._dirty) {
        this._dirty = true
        // 实现触发更新
        triggerEffects(this.dep)
      }
    })
  }

  // 类中的属性访问器，底层就是Object.defineProperty
  get value() {
    // 做依赖收集 需要让computed 收集外层effect
    trackEffects(this.dep) // 把当前的 effect 放进来

    if (this._dirty) { // 这个值是脏的，需要effect运行fn
      this._dirty = false // 这就是缓存的标识 多次访问同样的值 不进行run
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions: any) {
  let onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter

  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {console.warn('no set')}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  return new ComputedRefImpl(getter, setter)
}