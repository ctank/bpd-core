import EndEvent from './EndEvent'
import eventBus from '../../core/eventBus'

class TerminateEndEvent extends EndEvent {
  constructor(element, style = {}) {
    super(element, style)
    //
    this.style = style
    // 不存在或为父图形名称时修改为当前图形名称
    if (!element.data.name || element.data.name === eventBus.trigger('i18n', 'bpmn.EndEvent')) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.TerminateEndEvent')
    }

    this.eventDefinitionType = 'TerminateEventDefinition'

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

export default TerminateEndEvent
