import eventBus from '../../core/eventBus'
import { cloneElement, getBpmnNameByType } from '../../utils/utils'

const DEFAULT_CONFIG = {
  filter: [],
  suffix: '副本'
}

class Clipboard {
  constructor(options, config) {
    // 配置
    this.config = Object.assign({}, DEFAULT_CONFIG, config)
    // 复制数据集合
    this.copyElements = []
    //
    this.presetedIds = {}
    // ids
    this.ids = options.ids
    //
    this.plus = true
    //
    this.copyElementId = null
    //
    this.init()
  }

  init() {
    // 绑定Ctrl+C
    eventBus.trigger('key.bind', {
      key: 'Ctrl+C',
      fun: () => {
        // (this.copy.bind(this))()
        if (this.config && this.config.copyHandler) {
          this.config.copyHandler()
        } else {
          console.info('未配置复制事件！')
        }
      }
    })
    // 绑定Ctrl+V
    eventBus.trigger('key.bind', {
      key: 'Ctrl+V',
      fun: () => {
        if (this.config && this.config.pasteHandler) {
          this.config.pasteHandler()
        } else {
          console.info('未配置粘贴事件！')
        }
      }
    })
    // 粘贴事件
    eventBus.on('clipboard.copy', this.copy.bind(this))
    // 粘贴事件
    eventBus.on('clipboard.paste', this.paste.bind(this))
  }

  /**
   * 创建id
   */
  presetIds() {
    this.presetedIds = {}
    for (let i = 0; i < this.copyElements.length; i += 1) {
      const element = this.copyElements[i]
      this.presetedIds[element.data.id] = 'obj_' + this.ids.next()
    }
  }

  /**
   * 复制操作
   */
  copy() {
    this.copyElements = []
    const elements = eventBus.trigger('shape.select.get')
    elements.forEach(element => {
      const type = getBpmnNameByType(element.data.$type)
      if (!this.config.filter.includes(type)) {
        const newElement = cloneElement(element)
        this.copyElements.push(newElement)
      }
    })
    this.copyElements.sort((item1, item2) => {
      return item1.shape.shapeStyle.zindex - item2.shape.shapeStyle.zindex
    })
    this.presetIds()
    this.plus = true
  }

  /**
   * 粘贴
   */
  paste() {
    if (this.copyElements.length === 0) {
      return
    }
    let offsetX = 15
    let offsetY = 15

    const newElements = []
    const selectElements = []
    const elements = eventBus.trigger('element.get')

    for (let i = 0; i < this.copyElements.length; i += 1) {
      const element = this.copyElements[i]
      if (element.shape.bpmnName !== 'SequenceFlow') {
        // 调整zindex
        element.shape.shapeStyle.zindex = Object.keys(elements).length + 1
        if (this.plus) {
          // 调整复制节点位置
          element.plane.bounds.x += offsetX
          element.plane.bounds.y += offsetY
        }

        const newElement = cloneElement(element)

        newElement.data.name += this.config.suffix

        // 创建id
        newElement.data.id = this.presetedIds[element.data.id]

        newElements.push(newElement)
        selectElements.push(newElement.data.id)
      }
    }

    // 添加节点
    eventBus.trigger('element.add', newElements)
    // 渲染
    for (let i = 0; i < newElements.length; i += 1) {
      const element = newElements[i]
      const type = element.shape.bpmnName
      // 绘制图形
      if (type === 'SequenceFlow') {
        eventBus.trigger('connection.render', { element })
      } else {
        eventBus.trigger('shape.render', { type, element })
      }
    }
    eventBus.trigger('element.build')

    this.presetIds()
    eventBus.trigger('shape.select.remove')
    eventBus.trigger('shape.select', { ids: selectElements })
    this.plus = true
    return selectElements
  }
}

export default Clipboard
