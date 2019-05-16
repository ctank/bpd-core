import { isFunc } from '../utils/utils'

const str = s => {
  if (s == null) {
    return null
  }
  s = s.replace(/^\s+|\s+$/g, '')
  return s.length > 0 ? s.toLowerCase() : null
}

/**
 * 事件管理
 */
class Handler {
  constructor() {
    this.fns = []
    this.datas = []
  }
  /**
   * 添加事件
   * @param fn 事件
   * @param data 数据
   */
  add(fn, data) {
    this.fns.push(fn)
    this.datas.push(data)
  }
  /**
   * 移除事件
   * @param fn 事件
   */
  remove(fn) {
    const i = this.fns.indexOf(fn)
    if (i >= 0) {
      this.fns.splice(i, 1)
      this.datas.splice(i, 1)
    }
  }
  /**
   * 执行事件
   * @param sender 触发对象
   * @param data 数据
   */
  invoke(sender, data) {
    let res = null
    this.fns.forEach((fn, i) => {
      try {
        res = fn(sender, data, this.datas[i])
      } catch (error) {
        console.error(error)
      }
    })
    return res
  }
}

/**
 * 事件总线
 */
class EventBus {
  constructor(handers = {}) {
    this.handers = handers
  }
  /**
   * 绑定事件
   * @param eventName 事件名称
   * @param fn 事件
   * @param data 数据
   */
  on(eventName, fnOrData, fn) {
    eventName = str(eventName)
    if (eventName == null) {
      throw new Error('事件名无效')
    }
    if (!isFunc(fn)) {
      var temp = fn
      fn = fnOrData
      fnOrData = temp
    }
    if (!isFunc(fn)) {
      throw new Error('必须提供事件函数')
    }

    let handle = this.handers[eventName]
    if (handle == null) {
      handle = new Handler()
      this.handers[eventName] = handle
    }
    handle.add(fn, fnOrData)
  }
  /**
   * 解绑事件
   * @param eventName 事件名称
   * @param fn 事件
   */
  off(eventName, fn) {
    eventName = str(eventName)
    if (eventName == null) {
      return
    }
    const handle = this.handers[eventName]
    if (handle != null) {
      if (fn == null) {
        delete this.handers[eventName]
      } else {
        handle.remove(fn)
      }
    }
  }
  /**
   * 销毁
   */
  destroy() {
    this.handers = {}
  }
  /**
   * 触发事件
   * @param eventName 事件名称
   * @param sender 触发对象
   * @param data 数据
   */
  trigger(eventName, sender, data) {
    eventName = str(eventName)
    if (eventName == null) {
      return
    }
    const handle = this.handers[eventName]
    if (handle != null) {
      return handle.invoke(sender, data)
    }
  }
}

const instance = new EventBus()

export default instance
