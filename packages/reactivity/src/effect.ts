import { Target } from "./reactive"
// 全局effect
export let activeEffect: ReactiveEffect | undefined = undefined

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect // deps是Set 存放属性对应的effect
  if (deps.length) {
    for(let i = 0; i < deps.length; i++) {
      deps[i].delete(effect) // 解除effect，重新收集依赖
    }
    effect.deps.length = 0
  } 
}

export class ReactiveEffect<T = any> {
  active = true
  deps: any = []
  parent: ReactiveEffect | undefined = undefined
  constructor(
    public fn: () => T,
    public scheduler: () => any
  ) {}

  run() {
    if (!this.active) {
      this.fn()
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      // 在this.fn() 执行之前需要将当前effect 中的 deps 清理
      cleanupEffect(this)
      return this.fn()
    } finally {
      activeEffect = this.parent
    }
  }

  stop() {
    if (this.active) {
      this.active = false
    }
    cleanupEffect(this) // 停止effect收集
  }
}

export function effect<T = any>(fn: () => T, option: any = {}) {
  const _effect = new ReactiveEffect(fn, option.scheduler)
  _effect.run()
  // 需要绑定this，不绑定this 指向了window
  const runner: any = _effect.run.bind(_effect) // runner 的this 被指定为_effect 的this
  runner.effect = _effect // 将effect 挂载到runner 函数上
  return runner
}

/**
 * 一个对象 中的某个属性 对应的多个effect
 * WeakMap{对象: Map{key: Set[多个effect]}}
 */
const targetMap = new WeakMap() // targetMap 是个WeakMap
export function track(target: Target, type: string, key: string | symbol) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target) // depsMap 是个Map
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)  // dep 是个set
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffects(dep)
}

export function trackEffects(dep: any) {
  if (!activeEffect) return
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target: Target, type: string, key: string | symbol, value: any, oldValue: any) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 触发的值不在模板中使用

  let effects: ReactiveEffect[] = depsMap.get(key) // 存放着好多个effect

  if (effects) {
    triggerEffects(effects)
  }
}

export function triggerEffects(effects: ReactiveEffect[]) {
  effects = [...effects]
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      // console.log(effect.fn)
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}
