import Shape from './Shape'
import eventBus from '../../core/eventBus'

class ServiceTask extends Shape {
  constructor(element, style = {}) {
    super()
    //
    this.style = style
    //
    if (element.plane && element.plane.bounds) {
      element.plane.bounds.width = element.plane.bounds.width || 110
      element.plane.bounds.height = element.plane.bounds.height || 55
    }
    if (!element.data.name) {
      element.data.name = eventBus.trigger('i18n', 'bpmn.ServiceTask')
    }
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane

    this.bpmnName = 'ServiceTask'

    this.groupName = 'Task'

    this.actions = this.getPath()
  }
  /**
   * 获取绘图路径
   */
  getPath() {
    const { height, width } = this.plane.bounds
    const defaultContent = [
      {
        actions: [
          {
            action: 'font',
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 'normal',
            fontSize: '18px',
            fontFamily: 'bpmn',
            content: '\uE844',
            x: 4,
            y: 16
          }
        ]
      }
    ]
    return [
      {
        lineStyle: { lineStyle: 'solid' },
        actions: [
          { action: 'move', x: 0, y: 4 },
          { action: 'quadraticCurve', x1: 0, y1: 0, x: 4, y: 0 },
          { action: 'line', x: width - 4, y: 0 },
          { action: 'quadraticCurve', x1: width, y1: 0, x: width, y: 4 },
          { action: 'line', x: width, y: height - 4 },
          {
            action: 'quadraticCurve',
            x1: width,
            y1: height,
            x: width - 4,
            y: height
          },
          { action: 'line', x: 4, y: height },
          { action: 'quadraticCurve', x1: 0, y1: height, x: 0, y: height - 4 },
          { action: 'close' }
        ]
      },
      ...(this.style.content || defaultContent),
      {
        fillStyle: { type: 'none' },
        lineStyle: { lineWidth: 0 },
        actions: [
          { action: 'move', x: 0, y: 4 },
          { action: 'quadraticCurve', x1: 0, y1: 0, x: 4, y: 0 },
          { action: 'line', x: width - 4, y: 0 },
          { action: 'quadraticCurve', x1: width, y1: 0, x: width, y: 4 },
          { action: 'line', x: width, y: height - 4 },
          {
            action: 'quadraticCurve',
            x1: width,
            y1: height,
            x: width - 4,
            y: height
          },
          { action: 'line', x: 4, y: height },
          { action: 'quadraticCurve', x1: 0, y1: height, x: 0, y: height - 4 },
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
    return { x: 10, y: 0, width: width - 20, height: height }
  }
}

export default ServiceTask
