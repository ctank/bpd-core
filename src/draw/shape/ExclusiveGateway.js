import Shape from './Shape'

class ExclusiveGateway extends Shape {
  constructor(element, style = {}) {
    super(style)
    //
    this.style = style
    //
    if (element.plane && element.plane.bounds) {
      element.plane.bounds.width = element.plane.bounds.width || 50
      element.plane.bounds.height = element.plane.bounds.height || 50
    }
    //
    if (!element.data.name && element.data.name !== '') {
      element.data.name = style.name || ''
    }
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane

    this.bpmnName = 'ExclusiveGateway'

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
            x: width * 0.5 + width * 0.5 * 0.4 - width * 0.02,
            y: height * 0.5 - height * 0.5 * 0.4 - height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 - width * 0.5 * 0.4 - width * 0.02,
            y: height * 0.5 + height * 0.5 * 0.4 - height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 - width * 0.5 * 0.4 + width * 0.02,
            y: height * 0.5 + height * 0.5 * 0.4 + height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 + width * 0.5 * 0.4 + width * 0.02,
            y: height * 0.5 - height * 0.5 * 0.4 + height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 + width * 0.5 * 0.4 - width * 0.02,
            y: height * 0.5 - height * 0.5 * 0.4 - height * 0.02
          },
          { action: 'close' }
        ]
      },
      {
        fillStyle: { type: 'solid', color: '0, 0, 0' },
        lineStyle: { lineWidth: 0, lineStyle: 'solid' },
        actions: [
          { action: 'move', x: width * 0.5, y: height * 0.5 },
          {
            action: 'move',
            x: width * 0.5 - width * 0.5 * 0.4 + width * 0.02,
            y: height * 0.5 - height * 0.5 * 0.4 - height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 + width * 0.5 * 0.4 + width * 0.02,
            y: height * 0.5 + height * 0.5 * 0.4 - height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 + width * 0.5 * 0.4 - width * 0.02,
            y: height * 0.5 + height * 0.5 * 0.4 + height * 0.02
          },
          {
            action: 'line',
            x: width * 0.5 - width * 0.5 * 0.4 - width * 0.02,
            y: height * 0.5 - height * 0.5 * 0.4 + height * 0.02
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
    const { textStyle } = this.style
    const { height, width } = this.plane.bounds
    let textWidth = 120
    let textHeight = 30
    if (textStyle) {
      textWidth = textStyle.width || textWidth
      textHeight = textStyle.height || textHeight
    }
    return {
      x: width / 2 - textWidth / 2,
      y: height,
      width: textWidth,
      height: textHeight
    }
  }
}

export default ExclusiveGateway
