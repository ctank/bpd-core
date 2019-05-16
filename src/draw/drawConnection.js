import eventBus from '../core/eventBus'

import DrawUtils from './drawUtils'

import Connection from './shape/SequenceFlow'

import { setScale, restoreScale, canvasActions } from '../utils/utils'
import GradientUtils from '../utils/gradient'
import $ from '../utils/slimJQ'

class DrawConnection {
  constructor(options, $container) {
    this.options = options

    this.$container = $container
  }
  /**
   * 渲染
   * @param {*} type
   * @param {*} data
   */
  createConnection(data) {
    return new Connection(data)
  }
  /**
   * 渲染
   * @param {*} type
   * @param {*} data
   */
  render(element, rendered) {
    if (!element.shape) {
      element.shape = this.createConnection(element)
    }
    this.renderConnection(element, rendered)
  }
  /**
   * 渲染连线
   * @param {Object} connection 连线元素
   * @param {*} rendered
   */
  renderConnection(element, rendered) {
    const { shape, data, plane } = element
    const { sourceRef, targetRef } = data
    const { waypoint } = plane
    const sourcePoint = waypoint[0]
    const targetPoint = waypoint[waypoint.length - 1]
    const selectIds = eventBus.trigger('shape.select.getIds') || []
    const elements = eventBus.trigger('element.get')

    if (waypoint.length > 2 && shape.points.length <= 0) {
      shape.points = waypoint.filter((point, index) => {
        if (index === 0 || index === waypoint.length - 1) {
          return false
        } else {
          return true
        }
      })
    }

    if (rendered) {
      shape.points = DrawUtils.getConnectionPoints(shape, elements)
    }

    if (shape.linkerType === 'curve' || shape.linkerType === 'broken') {
      if (!shape.points || shape.points.length === 0) {
        shape.points = DrawUtils.getConnectionPoints(shape, elements)
      }
    }

    if (sourcePoint.angle == null) {
      sourcePoint.angle = DrawUtils.getAngle(waypoint[1], waypoint[0])
    }

    if (targetPoint.angle == null) {
      targetPoint.angle = DrawUtils.getAngle(
        waypoint[waypoint.length - 2],
        waypoint[waypoint.length - 1]
      )
    }

    let x1 = targetPoint.x
    let y1 = targetPoint.y
    let x2 = sourcePoint.x
    let y2 = sourcePoint.y
    if (targetPoint.x >= sourcePoint.x) {
      x1 = sourcePoint.x
      x2 = targetPoint.x
    }
    if (targetPoint.y >= sourcePoint.y) {
      y1 = sourcePoint.y
      y2 = targetPoint.y
    }

    shape.points.forEach((point, index) => {
      if (point.x < x1) {
        x1 = point.x
      } else {
        if (point.x > x2) {
          x2 = point.x
        }
      }
      if (point.y < y1) {
        y1 = point.y
      } else {
        if (point.y > y2) {
          y2 = point.y
        }
      }
    })

    const shapeBox = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }

    let $shape = this.$container.find('.shape-box[data-id="' + data.id + '"]')

    if ($shape.length === 0) {
      $shape = $(
        "<div class='shape-box' data-id='" +
          data.id +
          "'><canvas class='shape-canvas'></canvas></div>"
      ).appendTo(this.$container.find('.bpd-designer'))
    }

    const $shapeCanvas = $shape.find('.shape-canvas')
    const width = setScale(shapeBox.width + 20)
    const height = setScale(shapeBox.height + 20)
    $shapeCanvas.attr({ width, height })
    $shape.css({
      left: setScale(shapeBox.x - 10) + 'px',
      top: setScale(shapeBox.y - 10) + 'px',
      width,
      height
    })

    const shape2D = $shapeCanvas[0].getContext('2d')

    let bpmnStyle = this.options.bpmnStyle[shape.bpmnName] || {}

    const lineStyle = Object.assign({}, shape.lineStyle, bpmnStyle.lineStyle)

    shape2D.scale(this.options.scale, this.options.scale)
    shape2D.translate(10, 10)
    shape2D.lineWidth = lineStyle.lineWidth
    shape2D.strokeStyle = 'rgb(' + lineStyle.lineColor + ')'
    shape2D.fillStyle = 'rgb(' + lineStyle.lineColor + ')'
    shape2D.save()

    if (lineStyle.lineStyle === 'dashed') {
      DrawUtils.setLineDash(shape2D, [
        lineStyle.lineWidth * 8,
        lineStyle.lineWidth * 4
      ])
    } else {
      if (lineStyle.lineStyle === 'dot') {
        DrawUtils.setLineDash(shape2D, [
          lineStyle.lineWidth,
          lineStyle.lineWidth * 2
        ])
      } else {
        if (lineStyle.lineStyle === 'dashdot') {
          DrawUtils.setLineDash(shape2D, [
            lineStyle.lineWidth * 8,
            lineStyle.lineWidth * 3,
            lineStyle.lineWidth,
            lineStyle.lineWidth * 3
          ])
        }
      }
    }

    const startPoint = {
      x: sourcePoint.x - shapeBox.x,
      y: sourcePoint.y - shapeBox.y
    }
    const endPoint = {
      x: targetPoint.x - shapeBox.x,
      y: targetPoint.y - shapeBox.y
    }

    shape2D.beginPath()
    shape2D.moveTo(startPoint.x, startPoint.y)
    if (shape.linkerType === 'curve') {
      const point1 = shape.points[0]
      const point2 = shape.points[1]
      shape2D.bezierCurveTo(
        point1.x - shapeBox.x,
        point1.y - shapeBox.y,
        point2.x - shapeBox.x,
        point2.y - shapeBox.y,
        endPoint.x,
        endPoint.y
      )
    } else {
      shape.points.forEach((point, index) => {
        shape2D.lineTo(point.x - shapeBox.x, point.y - shapeBox.y)
      })
      shape2D.lineTo(endPoint.x, endPoint.y)
    }
    // TODO: 判断选中
    if (selectIds.indexOf(data.id) >= 0) {
      shape2D.shadowBlur = 4
      shape2D.shadowColor = '#ec5343'
    }

    shape2D.stroke()
    shape2D.restore()

    const startAngle = DrawUtils.getEndpointAngle(shape, 'sourceRef')

    this.renderArrow(
      startPoint,
      startAngle,
      sourceRef,
      lineStyle.beginArrowStyle,
      shape,
      sourcePoint.angle,
      shape2D
    )

    const endAngle = DrawUtils.getEndpointAngle(shape, 'targetRef')

    this.renderArrow(
      endPoint,
      endAngle,
      targetRef,
      lineStyle.endArrowStyle,
      shape,
      targetPoint.angle,
      shape2D
    )

    shape2D.restore()
    this.renderConnectionText(shape)
  }

  /**
   * 渲染箭头
   * @param {*} startPoint
   * @param {*} angle
   * @param {*} id
   * @param {*} arrowStyle
   * @param {*} shape
   * @param {*} rotate
   * @param {*} shape2D
   */
  renderArrow(startPoint, angle, id, arrowStyle, shape, rotate, shape2D) {
    if (arrowStyle === 'solidArrow') {
      const arrowWidth = 12
      const pi = Math.PI / 10
      const length = arrowWidth / Math.cos(pi)
      const point1 = {
        x: startPoint.x - length * Math.cos(angle - pi),
        y: startPoint.y - length * Math.sin(angle - pi)
      }
      const point2 = {
        x: startPoint.x - length * Math.sin(Math.PI / 2 - angle - pi),
        y: startPoint.y - length * Math.cos(Math.PI / 2 - angle - pi)
      }
      shape2D.beginPath()
      shape2D.moveTo(startPoint.x, startPoint.y)
      shape2D.lineTo(point1.x, point1.y)
      shape2D.lineTo(point2.x, point2.y)
      shape2D.lineTo(startPoint.x, startPoint.y)
      shape2D.closePath()
      shape2D.fill()
      shape2D.stroke()
    }

    // 适应连接图形
    if (id && arrowStyle !== 'solidCircle' && arrowStyle !== 'dashedCircle') {
      const element = eventBus.trigger('element.get', id)
      if (element) {
        shape2D.save()
        shape2D.translate(startPoint.x, startPoint.y)
        shape2D.rotate(rotate)
        shape2D.translate(-startPoint.x, -startPoint.y)
        const x = startPoint.x - element.shape.lineStyle.lineWidth / 2
        const y = startPoint.y - shape.lineStyle.lineWidth * 1.2
        const lineWidth1 = shape.lineStyle.lineWidth * 2
        const lineWidth2 = shape.lineStyle.lineWidth * 1.8
        const step = 1
        let pointX = x
        while (pointX <= x + lineWidth1) {
          let pointY = y
          while (pointY <= y + lineWidth2) {
            shape2D.clearRect(pointX, pointY, 1.5, 1.5)
            pointY += step
          }
          pointX += step
        }
        shape2D.restore()
      }
    }
  }

  /**
   * 渲染连线文本
   */
  renderConnectionText(shape) {
    const $shape = this.$container.find(
      '.shape-box[data-id="' + shape.data.id + '"]'
    )
    let $textBox = $shape.find('.text-box[data-shape=' + shape.data.id + ']')
    if ($textBox.length === 0) {
      $textBox = $(
        "<div class='text-box connection-text' data-shape='" +
          shape.data.id +
          "'></div>"
      ).appendTo($shape)
    }

    const fontStyle = shape.fontStyle
    const transform = 'scale(' + this.options.scale + ')'
    const style = {
      'line-height': Math.round(fontStyle.size * 1.25) + 'px',
      'font-size': fontStyle.size + 'px',
      'font-family': fontStyle.fontFamily,
      'font-weight': fontStyle.bold ? 'bold' : 'normal',
      'font-style': fontStyle.italic ? 'italic' : 'normal',
      'text-align': fontStyle.textAlign,
      color: 'rgb(' + fontStyle.color + ')',
      'text-decoration': fontStyle.underline ? 'underline' : 'none',
      '-webkit-transform': transform,
      '-ms-transform': transform,
      '-o-transform': transform,
      '-moz-transform': transform,
      transform: transform
    }
    $textBox.css(style)

    if (shape.data.name == null || shape.data.name.trim() === '') {
      $textBox.hide()
      return
    }

    $textBox.show()

    let text = shape.data.name
    // 长度超过12时切割
    if (text.length > 12) {
      text = text.substr(0, 12) + '...'
    }
    // 插入内容
    $textBox.html(text)
    $textBox.attr('title', shape.data.name)

    const midPoint = DrawUtils.getConnectionMidpoint(shape)
    const position = $shape.position()
    $textBox.css({
      left: setScale(midPoint.x) - position.left - $textBox.width() / 2,
      top: setScale(midPoint.y) - position.top - $textBox.height() / 2
    })
  }

  /**
   *
   * @param {*} element
   * @param {*} type
   * @param {*} x
   * @param {*} y
   */
  move(element, type, x, y) {
    const { data, plane, shape } = element
    const sourcePoint = plane.waypoint[0]
    const targetPoint = plane.waypoint[plane.waypoint.length - 1]
    const connectData = DrawUtils.getShapeByPosition(
      x,
      y,
      this.$container,
      true
    )

    let connectPos = null
    let connectId = null

    eventBus.trigger('anchor.point.hide')
    if (connectData != null) {
      const connectEle = connectData.element
      connectId = connectEle.data.id
      if (connectData.type === 'bounds') {
        connectPos = connectData.anchor
        eventBus.trigger('anchor.point.show', setScale(connectPos))
      } else {
        if (connectData.type === 'shape') {
          let connectPoint
          let connectShapeId
          if (type === 'source') {
            connectPoint = { x: targetPoint.x, y: targetPoint.y }
            connectShapeId = data.targetRef
          } else {
            connectPoint = {
              x: sourcePoint.x,
              y: sourcePoint.y
            }
            connectShapeId = data.sourceRef
          }
          if (connectEle.data.id === connectShapeId) {
            eventBus.trigger('anchor.point.hide')
            connectPos = { x: restoreScale(x), y: restoreScale(y), angle: null }
            connectId = null
          } else {
            const anchors = connectEle.shape.getAnchors()
            const bounds = connectEle.plane.bounds
            const center = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            }
            let length = -1
            let pos
            for (let i = 0; i < anchors.length; i += 1) {
              const anchor = anchors[i]

              const point = DrawUtils.getRotated(
                center,
                { x: bounds.x + anchor.x, y: bounds.y + anchor.y },
                connectEle.shape.shapeStyle.angle
              )
              const distance = DrawUtils.measureDistance(point, connectPoint)
              if (length === -1 || distance < length) {
                length = distance
                pos = point
              }
            }
            const angle = DrawUtils.getPointAngle(
              this.$container,
              connectEle.data.id,
              pos.x,
              pos.y,
              7
            )
            connectPos = { x: pos.x, y: pos.y, angle }
            eventBus.trigger('anchor.point.show', setScale(connectPos))
          }
        }
      }
    } else {
      eventBus.trigger('anchor.point.remove')
      eventBus.trigger('anchor.remove')
      connectPos = { x: restoreScale(x), y: restoreScale(y), angle: null }
      connectId = null
    }
    if (type === 'source') {
      data.sourceRef = connectId
      sourcePoint.x = connectPos.x
      sourcePoint.y = connectPos.y
      sourcePoint.angle = connectPos.angle
      if (connectId == null) {
        if (
          connectPos.x >= targetPoint.x - 6 &&
          connectPos.x <= targetPoint.x + 6
        ) {
          sourcePoint.x = targetPoint.x
        }
        if (
          connectPos.y >= targetPoint.y - 6 &&
          connectPos.y <= targetPoint.y + 6
        ) {
          sourcePoint.y = targetPoint.y
        }
      }
    } else {
      data.targetRef = connectId
      targetPoint.x = connectPos.x
      targetPoint.y = connectPos.y
      targetPoint.angle = connectPos.angle
      if (connectId == null) {
        if (
          connectPos.x >= sourcePoint.x - 6 &&
          connectPos.x <= sourcePoint.x + 6
        ) {
          targetPoint.x = sourcePoint.x
        }
        if (
          connectPos.y >= sourcePoint.y - 6 &&
          connectPos.y <= sourcePoint.y + 6
        ) {
          targetPoint.y = sourcePoint.y
        }
      }
    }
    this.renderConnection(element, true)
  }
}

export default DrawConnection
