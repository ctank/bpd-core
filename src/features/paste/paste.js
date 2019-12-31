import eventBus from '../../core/eventBus'
import { cloneElement } from '../../utils/utils'

class Paste {
  constructor(options) {
    // ids
    this.ids = options.ids
    //
    this.init()
  }

  init() {
    // 绑定Ctrl+V
    eventBus.trigger('key.bind', {
      key: 'Ctrl+V',
      fun: this.paste.bind(this)
    })
  }

  /**
   * 粘贴操作
   */
  paste() {
    const elements = eventBus.trigger('shape.select.get')
    const ids = eventBus.trigger('copy.get')
    const copyElements = []
    // 创建节点
    elements.forEach(element => {
      if (ids.includes(element.data.id)) {
        const newElement = cloneElement(element)
        newElement.data.id = 'obj_' + this.ids.next()
        copyElements.push(newElement)
      }
    })
    // 添加节点
    eventBus.trigger('element.add', copyElements)
    // 渲染
    for (let i = 0; i < copyElements.length; i += 1) {
      const element = copyElements[i]
      const type = element.shape.bpmnName
      // 绘制图形
      if (type === 'SequenceFlow') {
        eventBus.trigger('connection.render', { element })
      } else {
        eventBus.trigger('shape.render', { type, element })
      }
    }
  }
}

export default Paste
