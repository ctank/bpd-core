import Base from './Base'

class Shape extends Base {
  constructor(style) {
    super()
    // TODO: 子元素
    this.children = []
    // TODO: 父元素
    this.parent = ''
    // 缩放点
    this.resizeDir = ['tl', 'tr', 'br', 'bl']
    // 属性
    this.attribute = {
      container: false,
      visible: true,
      rotatable: false,
      linkable: true,
      editable: true,
      markerOffset: 5
    }
    // 描边样式
    this.lineStyle = Object.assign(
      {},
      { lineWidth: 2, lineColor: '50,50,50', lineStyle: 'solid' },
      style.lineStyle
    )
    // 填充样式
    this.fillStyle = Object.assign(
      {},
      { type: 'solid', color: '255,255,255' },
      style.fillStyle
    )
    // 高亮样式
    this.lightStyle = {}
    // 绘制方式
    this.actions = null
  }
}

export default Shape
