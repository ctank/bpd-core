import Shape from './Shape'

class ComplexGateway extends Shape {
  constructor(element, style = {}) {
    super()
    //
    this.style = style
    //
    if (element.plane && element.plane.bounds) {
      element.plane.bounds.width = element.plane.bounds.width || 50
      element.plane.bounds.height = element.plane.bounds.height || 50
    }
    //
    if (!element.data.name) {
      element.data.name = ''
    }
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane

    this.bpmnName = 'ComplexGateway'

    this.groupName = 'Gateway'

    this.actions = this.getPath()
  }
  /**
   * 获取绘图路径
   */
  getPath() {
    const { height, width } = this.plane.bounds
    const defaultContent = [
      {
        fillStyle: { type: 'solid', color: '0, 0, 0' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          {
            action: 'move',
            x:
              width * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.03
          },
          {
            action: 'line',
            x:
              width * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02
          },
          { action: 'close' }
        ]
      },
      {
        fillStyle: { type: 'solid', color: '0, 0, 0' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          {
            action: 'move',
            x:
              width * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 +
              Math.min(width, height) * 0.02
          },
          {
            action: 'line',
            x:
              width * 0.5 +
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02,
            y:
              height * 0.5 -
              Math.min(width, height) * 0.5 * 0.3 -
              Math.min(width, height) * 0.02
          },
          { action: 'close' }
        ]
      },
      {
        fillStyle: { type: 'solid', color: '0, 0, 0' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          {
            action: 'move',
            x: width * 0.5 - Math.min(width, height) * 0.027,
            y: height * 0.5 - Math.min(width, height) * 0.5 * 0.4
          },
          {
            action: 'line',
            x: width * 0.5 - Math.min(width, height) * 0.027,
            y: height * 0.5 + Math.min(width, height) * 0.5 * 0.4
          },
          {
            action: 'line',
            x: width * 0.5 + Math.min(width, height) * 0.027,
            y: height * 0.5 + Math.min(width, height) * 0.5 * 0.4
          },
          {
            action: 'line',
            x: width * 0.5 + Math.min(width, height) * 0.027,
            y: height * 0.5 - Math.min(width, height) * 0.5 * 0.4
          },
          {
            action: 'line',
            x: width * 0.5 - Math.min(width, height) * 0.027,
            y: height * 0.5 - Math.min(width, height) * 0.5 * 0.4
          },
          { action: 'close' }
        ]
      },
      {
        fillStyle: { type: 'solid', color: '0, 0, 0' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          {
            action: 'move',
            x: width * 0.5 - Math.min(width, height) * 0.5 * 0.4,
            y: height * 0.5 - Math.min(width, height) * 0.027
          },
          {
            action: 'line',
            x: width * 0.5 - Math.min(width, height) * 0.5 * 0.4,
            y: height * 0.5 + Math.min(width, height) * 0.027
          },
          {
            action: 'line',
            x: width * 0.5 + Math.min(width, height) * 0.5 * 0.4,
            y: height * 0.5 + Math.min(width, height) * 0.027
          },
          {
            action: 'line',
            x: width * 0.5 + Math.min(width, height) * 0.5 * 0.4,
            y: height * 0.5 - Math.min(width, height) * 0.027
          },
          {
            action: 'line',
            x: width * 0.5 - Math.min(width, height) * 0.5 * 0.4,
            y: height * 0.5 - Math.min(width, height) * 0.027
          },
          { action: 'close' }
        ]
      }
    ]
    return [
      {
        lineStyle: { lineStyle: 'solid' },
        actions: [
          { action: 'move', x: 0, y: height * 0.5 },
          { action: 'line', x: width * 0.5, y: 0 },
          { action: 'line', x: width, y: height * 0.5 },
          { action: 'line', x: width * 0.5, y: height },
          { action: 'line', x: 0, y: height * 0.5 },
          { action: 'close' }
        ]
      },
      ...(this.style.content || defaultContent),
      {
        fillStyle: { type: 'none' },
        lineStyle: { lineWidth: 0 },
        actions: [
          { action: 'move', x: 0, y: height * 0.5 },
          { action: 'line', x: width * 0.5, y: 0 },
          { action: 'line', x: width, y: height * 0.5 },
          { action: 'line', x: width * 0.5, y: height },
          { action: 'line', x: 0, y: height * 0.5 },
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

export default ComplexGateway
