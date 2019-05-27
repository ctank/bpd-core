import $ from '../utils/slimJQ'

import Shape, { init as initGroup } from './shape'

import { setScale, canvasActions } from '../utils/utils'
import GradientUtils from '../utils/gradient'
import DrawUtils from './drawUtils'

class DrawShape {
  constructor(options, $container) {
    this.options = options

    this.$container = $container

    initGroup()
  }
  /**
   * 创建图形数据
   * @param {*} type
   * @param {*} data
   */
  createShape(type, data) {
    return new Shape[type](data, this.options.bpmnStyle[type])
  }
  /**
   * 渲染
   * @param {*} type
   * @param {*} element
   */
  render(type, element) {
    if (!element.shape) {
      element.shape = this.createShape(type, element)
    }
    this.renderShape(element)
  }
  /**
   * 渲染图形
   */
  renderShape(element) {
    const { shape, data, plane } = element

    let $shape = this.$container.find('.shape-box[data-id="' + data.id + '"]')
    if ($shape.length === 0) {
      $shape = $(
        "<div class='shape-box' data-id='" +
          data.id +
          "'><canvas class='shape-canvas'></canvas></div>"
      ).appendTo(this.$container.find('.bpd-designer'))
    }

    const { x, y, width, height } = plane.bounds
    const { angle, zindex } = shape.shapeStyle

    const shapeBoxSize = DrawUtils.getShapeBox(element)
    const shapeW = shapeBoxSize.width + 20
    const shapeH = shapeBoxSize.height + 20

    const $shapeCanvas = $shape.find('.shape-canvas')
    $shapeCanvas.attr({ width: shapeW, height: shapeH })
    $shape.css({
      left: setScale(shapeBoxSize.x - 10) + 'px',
      top: setScale(shapeBoxSize.y - 10) + 'px',
      width: shapeW,
      height: shapeH
    })

    const shape2D = $shapeCanvas[0].getContext('2d')
    shape2D.clearRect(0, 0, width + 20, height + 20)
    shape2D.scale(this.options.scale, this.options.scale)
    shape2D.translate(10, 10)
    shape2D.translate(x - shapeBoxSize.x, y - shapeBoxSize.y)
    shape2D.translate(width / 2, height / 2)
    shape2D.rotate(angle)
    shape2D.translate(-(width / 2), -(height / 2))
    shape2D.globalAlpha = shape.shapeStyle.alpha
    shape2D.lineJoin = 'round'

    this.renderShapePath(shape2D, element)
    this.renderText(shape, shapeBoxSize)
  }
  /**
   * 渲染图形路径
   * @param {*} shape2D
   * @param {*} element
   */
  renderShapePath(shape2D, element, xx) {
    const { width, height } = element.plane.bounds
    let paths
    if (xx && canvasActions.drawIcon) {
      paths = canvasActions.drawIcon(width, height)
    } else {
      paths = element.shape.actions
    }
    // TODO:
    this.renderPath(shape2D, element, paths, xx)
  }

  /**
   * 渲染路径
   * @param {*} shape2D
   * @param {*} shape
   * @param {*} paths
   * @param {*} a
   */
  renderPath(shape2D, element, paths, xx) {
    const { data, plane, shape } = element
    for (let i = 0; i < paths.length; i += 1) {
      const path = paths[i]
      shape2D.save()
      shape2D.beginPath()

      let bpmnStyle = this.options.bpmnStyle[shape.bpmnName] || {}
      let shapeStyle = {}
      for (let i = 0; i < this.options.shapeStyle.length; i += 1) {
        const elementStyle = this.options.shapeStyle[i]
        if (elementStyle.id === data.id) {
          shapeStyle = elementStyle
        }
      }
      const lineStyle = Object.assign(
        {},
        shape.lineStyle,
        path.lineStyle,
        bpmnStyle.lineStyle,
        shapeStyle.lineStyle,
        shape.lightStyle.lineStyle
      )

      const fillStyle = Object.assign(
        {},
        shape.fillStyle,
        path.fillStyle,
        bpmnStyle.fillStyle,
        shapeStyle.fillStyle,
        shape.lightStyle.fillStyle
      )

      if (path.fillStyle && path.lineStyle.lineWidth === 0) {
        fillStyle.color = lineStyle.lineColor
      }

      for (let j = 0; j < path.actions.length; j += 1) {
        const item = path.actions[j]
        canvasActions[item.action](shape2D, item, shapeStyle)
      }

      this.fillShape(shape2D, shape, fillStyle)

      // 描边
      if (lineStyle.lineWidth) {
        shape2D.lineWidth = lineStyle.lineWidth
        shape2D.strokeStyle = 'rgb(' + lineStyle.lineColor + ')'
        if (lineStyle.lineStyle === 'dashed') {
          // TODO:
          if (xx) {
            DrawUtils.setLineDash(shape2D, [
              lineStyle.lineWidth * 4,
              lineStyle.lineWidth * 2
            ])
          } else {
            DrawUtils.setLineDash(shape2D, [
              lineStyle.lineWidth * 6,
              lineStyle.lineWidth * 3
            ])
          }
        } else {
          if (lineStyle.lineStyle === 'dot') {
            DrawUtils.setLineDash(shape2D, [
              lineStyle.lineWidth,
              lineStyle.lineWidth * 2
            ])
          } else {
            if (lineStyle.lineStyle === 'dashdot') {
              DrawUtils.setLineDash(shape2D, [
                lineStyle.lineWidth * 6,
                lineStyle.lineWidth * 2,
                lineStyle.lineWidth,
                lineStyle.lineWidth * 2
              ])
            }
          }
        }
        shape2D.stroke()
      }
      shape2D.restore()
    }
  }
  /**
   * 渲染文本
   * @param {*} shape
   * @param {*} shapeBoxSize
   */
  renderText(shape, shapeBoxSize) {
    const { x, y, width, height } = shape.plane.bounds
    const $shape = this.$container.find(
      '.shape-box[data-id="' + shape.data.id + '"]'
    )
    let $textBox = $shape.find('.text-box[data-shape=' + shape.data.id + ']')
    if ($textBox.length === 0) {
      $textBox = $(
        "<textarea class='text-box' data-shape='" +
          shape.data.id +
          "'></textarea>"
      ).appendTo($shape)
      // 焦点事件
      $textBox.on('focus', function() {
        $(this).blur()
      })
    }

    $textBox.attr('readonly', 'readonly')
    if (shape.data.name == null || shape.data.name.trim() === '') {
      $textBox.css({ height: '0px', width: '0px' }).hide()
      return
    }

    const fontStyle = shape.fontStyle

    $textBox
      .css({
        'line-height': Math.round(fontStyle.size * 1.25) + 'px',
        'font-size': fontStyle.size + 'px',
        'font-family': fontStyle.fontFamily,
        'font-weight': fontStyle.bold ? 'bold' : 'normal',
        'font-style': fontStyle.italic ? 'italic' : 'normal',
        'text-align': fontStyle.textAlign,
        color: 'rgb(' + fontStyle.color + ')',
        'text-decoration': fontStyle.underline ? 'underline' : 'none',
        opacity: shape.shapeStyle.alpha
      })
      .show()

    const textBlock = shape.getTextBlock()
    if (shape.fontStyle.orientation === 'horizontal') {
      const position = {
        x: textBlock.x + textBlock.width / 2,
        y: textBlock.y + textBlock.height / 2
      }
      textBlock.x = position.x - textBlock.height / 2
      textBlock.y = position.y - textBlock.width / 2
      textBlock.width = textBlock.height
      textBlock.height = textBlock.width
    }
    $textBox.css({ width: textBlock.width })
    $textBox.height(0)
    $textBox.val(shape.data.name)
    $textBox.scrollTop(99999)
    const scrollTop = $textBox.scrollTop()

    let top = 0
    if (fontStyle.vAlign === 'middle') {
      top = textBlock.y + textBlock.height / 2 - scrollTop / 2
    } else {
      if (shape.fontStyle.vAlign === 'bottom') {
        top = textBlock.y + textBlock.height - scrollTop
      } else {
        top = textBlock.y
      }
    }
    let position = {
      x: textBlock.x + textBlock.width / 2,
      y: top + scrollTop / 2
    }
    let angle = shape.shapeStyle.angle
    if (angle !== 0) {
      position = DrawUtils.getRotated(
        { x: width / 2, y: height / 2 },
        position,
        angle
      )
    }
    if (fontStyle.orientation === 'horizontal') {
      angle = (Math.PI * 1.5 + angle) % (Math.PI * 2)
    }
    const rotate = Math.round((angle / (Math.PI * 2)) * 360)
    const transform =
      'rotate(' + rotate + 'deg) scale(' + this.options.scale + ')'
    const textBoxWidth = textBlock.width
    const textBoxHeight = scrollTop
    $textBox.css({
      width: textBoxWidth,
      height: textBoxHeight,
      left: setScale(position.x + (x - shapeBoxSize.x) + 10) - textBoxWidth / 2,
      top: setScale(position.y + (y - shapeBoxSize.y) + 10) - scrollTop / 2,
      '-webkit-transform': transform,
      '-ms-transform': transform,
      '-o-transform': transform,
      '-moz-transform': transform,
      transform: transform
    })
  }

  /**
   * 填充图形
   * @param {*} shape2D
   * @param {*} shape
   * @param {*} fillStyle
   */
  fillShape(shape2D, shape, fillStyle) {
    shape2D.save()
    if (fillStyle.type === 'solid') {
      shape2D.fillStyle = 'rgb(' + fillStyle.color + ')'
      shape2D.fill()
    } else {
      if (fillStyle.type === 'gradient') {
        let gradient
        if (fillStyle.gradientType === 'linear') {
          gradient = GradientUtils.createLinearGradient(
            shape2D,
            shape,
            fillStyle
          )
        } else {
          gradient = GradientUtils.createRadialGradient(
            shape2D,
            shape,
            fillStyle
          )
        }
        shape2D.fillStyle = gradient
        shape2D.fill()
      }
    }
    shape2D.restore()
  }
}

export default DrawShape
