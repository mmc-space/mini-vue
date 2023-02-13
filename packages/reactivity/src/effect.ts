import type { Target } from './reactive'
import type { Dep } from './dep'
export let activeEffect: ReactiveEffect | undefined

// 数据变化要重新执行effect 所以要将effect 弄成响应式的
export class ReactiveEffect<T = any> {
  active = true // 这个effect 默认是激活状态
  deps: Dep[] = []
  parent: ReactiveEffect | undefined = undefined
  constructor(
    public fn: () => T
  ) {
    
  }

  // run 就是执行effect
  run() {
    if (!this.active) { // 如果非激活的情况，只需要执行函数， 不需要进行依赖收集
      this.fn()
    }
    
    // 依赖收集 将当前的effect 和 稍后渲染的属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this
      return this.fn() // 当稍后调用取值操作的时候， 就可以获取到这个全局的acevieEffect 
    } finally {
      // activeEffect还原到parent
      activeEffect = this.parent
    }
  }
}

export function effect<T = any>(fn: () => T) {
  // 这里的fn 可以根据状态变化，重新执行，effect 可以嵌套
  const _effect = new ReactiveEffect(fn)

  _effect.run() // 默认先执行一次
}


/**
 * 对象某个属性 -> 多个effect 
 * WeakMap = { 对象: Map{ name: Set } }
 * { 对象: {name: []} }
 * 
 * 一个effect 对应多个属性， 一个属性对应多个effect
 * 每次执行effect 之前要把所有的依赖都删掉
 */
const targetMap = new WeakMap()
export function track(target: Target, type: string, key: string | symbol) {
  if (!activeEffect) return

  let depsMap =  targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)  // 去重
  if(shouldTrack) {
    dep.add(activeEffect)// dep 记录对应的 effect
    activeEffect.deps.push(dep) // effect 记录对应的 dep
  }
}

export function trigger(target: object, type: string, key?: unknown, value?: unknown, oldValue?: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 触发的值不在模版中使用
  const effects =  depsMap.get(key) // 找到属性对应的effect

  effects && effects.forEach((effect: ReactiveEffect) => {
    // 在执行effect 的时候，又要执行自己，需要屏蔽 不要无限调用
    if (effect !== activeEffect) {
      effect.run()
    }
  })
}