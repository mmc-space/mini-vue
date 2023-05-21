import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = Object.assign(nodeOps, { patchProp }) // domAPI 属性API

// createRenderer h
// createRenderer(renderOptions).render(h('h1', 'hello'), document.getElementById('app'))
// createRenderer 是从runtime-core中来的

export function render(vnode: any, container: any) {
  // 在创建渲染器的时候传入选项
  createRenderer(renderOptions).render(vnode, container)
}

export * from '@vue/runtime-core'