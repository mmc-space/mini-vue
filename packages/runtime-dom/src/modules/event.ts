
function createInvoker(callback: any) {
  // invoker.value = callback 就是换的事件
  const invoker = (e: any) => invoker.value(e)
  invoker.value = callback
  return invoker
}

// onClick: [_ctx.aa, _ctx.bb]
export function patchEvent(el: any, eventName: any, nextValue: any) {
  // 先移除掉时间，再重新绑定事件
  // remove -> add （效率低）

  // 可以在绑定事件之前绑定一个自定义事件, 没次改变事件只需改变函数中的方法就行
  // add = () => {

  // }

  let invokers = el._vei || (el._vei = {})

  let exits = invokers[eventName] // 先看有没有缓存过

  if (exits && nextValue) { // 已经绑定过事件了
    exits.value = nextValue // 没有卸载函数 只是改了invoker.value 属性
  } else { // onClick => click
    let event = eventName.slice(2).toLowerCase()
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    } else if (exits) { // 给的值为空的话 先看有没有老值，如果有老值，需要将老的绑定事件移除掉
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}

// 第一次绑定了onClick 事件 ‘a’ e._vei = {click:onClick} el.addEventListener(click, (e) => a(e))
// 第二次换绑了onClick 事件 ‘b’ e._vei = {click:onClick} el.addEventListener(click, (e) => b(e))
// 第三次绑定了onClick null  el.removeEventListener(click, (e) => b(e)) el._vei = {}
