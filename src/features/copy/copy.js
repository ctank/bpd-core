import eventBus from '../../core/eventBus'
import { getBpmnNameByType } from '../../utils/utils'

const DEFAULT_CONFIG = {
  filter: []
}

class Copy {
  constructor(config) {
    // 配置
    this.config = Object.assign({}, DEFAULT_CONFIG, config)
    // 复制数据集合
    this.copyIds = []
    //
    this.init()
  }

  init() {
    // 绑定Ctrl+C
    eventBus.trigger('key.bind', {
      key: 'Ctrl+C',
      fun: this.copy.bind(this)
    })
    // 获取复制数据
    eventBus.on('copy.get', this.getIds.bind(this))
  }

  /**
   * 获取复制数据
   */
  getIds() {
    return this.copyIds
  }

  /**
   * 复制操作
   */
  copy() {
    const elements = eventBus.trigger('shape.select.get')
    const ids = []
    elements.forEach(element => {
      const type = getBpmnNameByType(element.data.$type)
      if (!this.config.filter.includes(type)) {
        ids.push(element.data.id)
      }
    })
    this.copyIds = ids
  }
}

export default Copy
