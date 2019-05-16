import drawUtils from '../draw/drawUtils'

const GradientUtils = {
  /**
   * 线性渐变色
   * @param {*} shape2D
   * @param {*} shape
   * @param {*} fillStyle
   */
  createLinearGradient: (shape2D, shape, fillStyle) => {
    const { width, height } = shape.bpmnPlane.bounds
    let start = { x: width / 2, y: 0 } // c
    let end = { x: width / 2, y: height } //e
    let angle = fillStyle.angle // d
    if (width > height) {
      start = { x: 0, y: height / 2 }
      end = { x: width, y: height / 2 }
      angle = (h.angle + Math.PI / 2) % (Math.PI * 2)
    }
    if (angle !== 0) {
      const center = { x: width / 2, y: height / 2 }
      start = drawUtils.getRotated(center, start, angle)
      end = drawUtils.getRotated(center, end, angle)
      if (start.x < 0) {
        start.x = 0
      }
      if (start.x > width) {
        start.x = width
      }
      if (start.y < 0) {
        start.y = 0
      }
      if (start.y > height) {
        start.y = height
      }
      if (end.x < 0) {
        end.x = 0
      }
      if (end.x > width) {
        end.x = width
      }
      if (end.y < 0) {
        end.y = 0
      }
      if (end.y > height) {
        end.y = height
      }
    }
    const gradient = shape2D.createLinearGradient(
      start.x,
      start.y,
      end.x,
      end.y
    )
    gradient.addColorStop(0, 'rgb(' + fillStyle.beginColor + ')')
    gradient.addColorStop(1, 'rgb(' + fillStyle.endColor + ')')
    return gradient
  },
  /**
   * 放射性渐变色
   * @param {*} shape2D
   * @param {*} shape
   * @param {*} fillStyle
   */
  createRadialGradient: (shape2D, shape, fillStyle) => {
    const { width, height } = shape.bpmnPlane.bounds
    const radius = width < height ? width : height
    const gradient = shape2D.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      radius * fillStyle.radius
    )
    gradient.addColorStop(0, 'rgb(' + fillStyle.beginColor + ')')
    gradient.addColorStop(1, 'rgb(' + fillStyle.endColor + ')')
    return gradient
  }
}

export default GradientUtils
