export const isObject = (value: any) => {
  return typeof value === 'object' && value !== undefined
}
export const extend = Object.assign