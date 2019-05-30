import Shape from './Shape'
import eventBus from '../../core/eventBus'

class StartEvent extends Shape {
  constructor(element, style = {}) {
    super(style)
    //
    this.style = style
    //
    if (element.plane && element.plane.bounds) {
      element.plane.bounds.width = element.plane.bounds.width || 40
      element.plane.bounds.height = element.plane.bounds.height || 40
    }
    if (!element.data.name) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.StartEvent')
    }
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane

    this.bpmnName = 'StartEvent'

    this.groupName = 'StartEvent'

    this.actions = this.getPath()
  }
  /**
   * 获取绘图路径
   */
  getPath() {
    const { height, width } = this.plane.bounds
    const defaultContent = []
    return [
      {
        lineStyle: { lineStyle: 'solid' },
        actions: [
          { action: 'move', x: 0, y: height / 2 },
          {
            action: 'curve',
            x1: 0,
            y1: -height / 6,
            x2: width,
            y2: -height / 6,
            x: width,
            y: height / 2
          },
          {
            action: 'curve',
            x1: width,
            y1: height + height / 6,
            x2: 0,
            y2: height + height / 6,
            x: 0,
            y: height / 2
          },
          { action: 'close' }
        ]
      },
      ...(this.style.content || defaultContent),
      {
        fillStyle: { type: 'none' },
        lineStyle: { lineWidth: 0 },
        actions: [
          { action: 'move', x: 0, y: height / 2 },
          {
            action: 'curve',
            x1: 0,
            y1: -height / 6,
            x2: width,
            y2: -height / 6,
            x: width,
            y: height / 2
          },
          {
            action: 'curve',
            x1: width,
            y1: height + height / 6,
            x2: 0,
            y2: height + height / 6,
            x: 0,
            y: height / 2
          },
          { action: 'close' }
        ]
      }
    ]
  }

  /**
   * 获取文本范围
   */
  getTextBlock() {
    const { height, width } = this.plane.bounds
    return { x: width / 2 - 60, y: height, width: 120, height: 30 }
  }
}

export default StartEvent
