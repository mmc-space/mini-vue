import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

export const renderOptions = Object.assign(nodeOps, { patchProp })
console.log(renderOptions)
