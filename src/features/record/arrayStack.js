class ArrayStack {
  constructor() {
    // 状态
    this.status = true
    // 堆栈
    this.stack = []
  }
  // 压栈操作
  push(element) {
    this.stack.push(element)
  }
  // 退栈操作
  pop() {
    return this.stack.pop()
  }
  // 获取栈顶元素
  top() {
    return this.stack[this.stack.length - 1]
  }
  // 获取栈长
  size() {
    return this.stack.length
  }
  // 清空栈
  clear() {
    this.stack = []
    return true
  }
  // 修改状态
  setStatus(status) {
    this.status = status
  }
}

export default ArrayStack
