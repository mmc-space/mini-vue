export const isObject = (value: any) => {
  return typeof value === 'object' && value !== undefined
}
export const extend = Object.assign
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
