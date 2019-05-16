class Base {
  constructor() {
    // 分组
    this.group = ''
    // 分组名称
    this.groupName = null
    // TODO: 锁定
    this.locked = false
    // 序号
    this.orderIndex = 0
    // 标记尺寸
    this.markerSize = 14
    // 图形样式
    this.shapeStyle = { alpha: 1, zindex: 0, angle: 0 }
    // 字体样式
    this.fontStyle = {
      fontFamily: 'Arial',
      size: 13,
      color: '50,50,50',
      bold: false,
      italic: false,
      underline: false,
      textAlign: 'center',
      vAlign: 'middle',
      orientation: 'vertical'
    }
  }
  /**
   * 获取绘图路径
   */
  getPath() {
    const { height, width } = this.plane.bounds
    return [
      {
        actions: [
          { action: 'move', x: 0, y: 0 },
          { action: 'line', x: width, y: 0 },
          { action: 'line', x: width, y: height },
          { action: 'line', x: 0, y: height },
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
  /**
   * 获取锚点位置
   */
  getAnchors() {
    const { height, width } = this.plane.bounds
    return [
      { x: width / 2, y: 0 },
      { x: width / 2, y: height },
      { x: 0, y: height / 2 },
      { x: width, y: height / 2 }
    ]
  }
}

export default Base
