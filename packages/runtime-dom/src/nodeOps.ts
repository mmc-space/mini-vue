// node 节点操作
export const nodeOps = {
  // 增加
  insert(child: any, parent: any, anchor = null) {
    parent.insertBefore(child, anchor) // insertBefore 可以等价于 appendChild
  },
  // 删除
  remove(child: any) {
    const parentNode = child.parentNode
    if (parentNode) {
      parentNode.removeChild(child)
    }
  },

  // 修改
  // 元素中的内容
  setElementText(el: any, text: any) {
    el.textContent = text
  },
  // 文本
  setText(node: any, text: any) {
    node.nodeValue = text
  },

  // 查询
  querySelector(selector: any) {
    return document.querySelector(selector)
  },
  parentNode(node: any) {
    return node.parentNode
  },
  nextSibling(node: any) {
    return node.nextSibling
  },

  // 创建 
  // 元素
  createElement(tagName: any) {
    return document.createElement(tagName)
  },
  // 文本
  createText(text: any) {
    return document.createTextNode(text)
  }
}