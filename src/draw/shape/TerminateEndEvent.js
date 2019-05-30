import Shape from './Shape'
import eventBus from '../../core/eventBus'

class EndEvent extends Shape {
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
        style.name || eventBus.trigger('i18n', 'bpmn.TerminateEndEvent')
    }
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane

    this.bpmnName = 'TerminateEndEvent'

    this.groupName = 'EndEvent'

    this.actions = this.getPath()
  }
  /**
   * 获取绘图路径
   */
  getPath() {
    const { height, width } = this.plane.bounds
    const { lineWidth } = this.lineStyle

    const defaultContent = [
      {
        fillStyle: { type: 'solid', color: '50,50,50' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          { action: 'move', x: width * 0.5 - width * 0.25, y: height * 0.5 },
          {
            action: 'curve',
            x1: width * 0.5 - width * 0.25,
            y1: height * 0.5 - ((height * 2) / 3) * 0.5,
            x2: width * 0.5 + width * 0.25,
            y2: height * 0.5 - ((height * 2) / 3) * 0.5,
            x: width * 0.5 + width * 0.25,
            y: height * 0.5
          },
          {
            action: 'curve',
            x1: width * 0.5 + width * 0.25,
            y1: height * 0.5 + ((height * 2) / 3) * 0.5,
            x2: width * 0.5 - width * 0.25,
            y2: height * 0.5 + ((height * 2) / 3) * 0.5,
            x: width * 0.5 - width * 0.25,
            y: height * 0.5
          },
          { action: 'close' }
        ]
      }
    ]

    return [
      {
        lineStyle: { lineWidth: lineWidth + 2, lineStyle: 'solid' },
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

export default EndEvent
