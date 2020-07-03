import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import { setScale, restoreScale } from '../../utils/utils'
import { cloneJSON } from '../../utils/clone'

class ShapeMove {
  constructor(options, $container) {
    this.options = options

    this.$container = $container

    this.init()
  }
  init() {
    // 鼠标移动事件
    eventBus.on('shape.drag', this.dragShape.bind(this))
    // 鼠标移动事件
    eventBus.on('connection.drag', this.dragConnection.bind(this))
    //
    eventBus.on('destroy', this.destroy.bind(this))
  }

  dragShape({ state, element }) {
    const { $container, options } = this
    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    $designer.on('mousedown.drag', e => {
      eventBus.trigger('direction.hide')

      let pos1 = DrawUtils.getRelativePos(e.pageX, e.pageY, $designer)
      let selects = eventBus.trigger('shape.select.get')

      let drag = true
      if (
        selects.length === 1 &&
        selects[0].shape.bpmnName === 'SequenceFlow'
      ) {
        drag = false
      }
      let bounds = null
      if (drag) {
        bounds = DrawUtils.getBounding(selects)
      }

      const connectionIds = []
      if (drag) {
        for (let i = 0; i < selects.length; i += 1) {
          const { data, shape } = selects[i]
          if (shape.bpmnName === 'SequenceFlow') {
            if (data.sourceRef && connectionIds.indexOf(data.sourceRef) < 0) {
              connectionIds.push(data.sourceRef)
            }
            if (data.targetRef && connectionIds.indexOf(data.targetRef) < 0) {
              connectionIds.push(data.targetRef)
            }
          }
          if (connectionIds.indexOf(data.id) < 0) {
            connectionIds.push(data.id)
          }
        }
      }

      const connections = DrawUtils.getOutConnections(selects)
      selects = selects.concat(connections)

      $layout.on('mousemove.drag', e2 => {
        let pos2 = DrawUtils.getRelativePos(e2.pageX, e2.pageY, $designer)
        let pos = {
          x: pos2.x - pos1.x,
          y: pos2.y - pos1.y
        }
        // 根据位移判断是否处于拖拽
        if ((pos.x > 0 || pageXOffset.y > 0) && drag) {
          state.change('drag_shapes')
        }
        if (drag) {
          const newBounds = cloneJSON(bounds)
          newBounds.x += pos.x
          newBounds.y += pos.y

          const snapLine = eventBus.trigger('shape.snapline.show', {
            size: newBounds,
            ids: connectionIds
          })

          pos = { x: newBounds.x - bounds.x, y: newBounds.y - bounds.y }
          pos2 = { x: pos1.x + pos.x, y: pos1.y + pos.y }
          bounds.x += pos.x
          bounds.y += pos.y
        }
        if (pos.x === 0 && pos.y === 0) {
          return
        }
        this.moveShape(selects, pos)
        pos1 = pos2
        $(document)
          .off('mouseup.drop')
          .on('mouseup.drop', function () {
            eventBus.trigger('element.update', selects)
            $(document).off('mouseup.drop')
          })
      })
      $(document).on('mouseup.drag', function () {
        state.reset()
        $layout.off('mousemove.drag')
        $designer.off('mousedown.drag')
        $(document).off('mouseup.drag')
        eventBus.trigger('shape.snapline.hide')
        eventBus.trigger('shape.tooltip.hide')
        eventBus.trigger('direction.show')
      })
    })
  }

  dragConnection({ state, element, point }) {
    const { $container, options } = this
    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    $designer.on('mousedown.dragconnection', () => {
      state.change('drag_connection')
      const selectIds = eventBus.trigger('shape.select.getIds')
      let isSelect = false
      if (selectIds.length > 1) {
        isSelect = true
      }
      $layout.on('mousemove.dragconnection', e => {
        $layout.css('cursor', 'default')
        const mousePos = DrawUtils.getRelativePos(e.pageX, e.pageY, $designer)
        this.moveLinker(element, point, mousePos.x, mousePos.y)
        if (isSelect) {
        }
        $(document)
          .off('mouseup.dropconnection')
          .on('mouseup.dropconnection', function () {
            $(document).off('mouseup.dropconnection')
            eventBus.trigger('element.update', element)
          })
      })
      $(document).on('mouseup.dragconnection', function () {
        eventBus.trigger('anchor.point.remove')
        state.reset()
        $designer.off('mousedown.dragconnection')
        $layout.off('mousemove.dragconnection')
        $(document).off('mouseup.dragconnection')
      })
    })
  }

  /**
   *
   * @param {*} elements
   * @param {*} pos
   */
  moveShape(elements, pos) {
    const ids = []
    const selectIds = eventBus.trigger('shape.select.getIds')

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      ids.push(element.data.id)
    }
    const restorePos = restoreScale(pos)
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (element.shape.bpmnName === 'SequenceFlow') {
        const { data, plane, shape } = element
        var h = false
        var m = false
        if (!selectIds.indexOf(data.id) >= 0) {
          if (data.sourceRef != null && ids.indexOf(data.sourceRef) >= 0) {
            plane.waypoint[0].x += restorePos.x
            plane.waypoint[0].y += restorePos.y
            h = true
          }
          if (data.targetRef != null && ids.indexOf(data.targetRef) >= 0) {
            plane.waypoint[plane.waypoint.length - 1].x += restorePos.x
            plane.waypoint[plane.waypoint.length - 1].y += restorePos.y
            m = true
          }
        } else {
          if (data.sourceRef == null || ids.indexOf(data.sourceRef) >= 0) {
            plane.waypoint[0].x += restorePos.x
            plane.waypoint[0].y += restorePos.y
            h = true
          }
          if (data.targetRef == null || ids.indexOf(data.targetRef) >= 0) {
            plane.waypoint[plane.waypoint.length - 1].x += restorePos.x
            plane.waypoint[plane.waypoint.length - 1].y += restorePos.y
            m = true
          }
        }
        if (h && m) {
          for (let i = 0; i < shape.points.length; i += 1) {
            const point = shape.points[i]
            point.x += restorePos.x
            point.y += restorePos.y
          }
          const $shape = this.$container.find(
            '.shape-box[data-id="' + data.id + '"]'
          )
          const shapePos = $shape.position()

          $shape.css({
            left: (shapePos.left += pos.x),
            top: (shapePos.top += pos.y)
          })
        } else {
          if (h || m) {
            eventBus.trigger('connection.render', { element, rendered: true })
          }
        }
      } else {
        this.moveDom(element, restorePos, pos)
      }
    }

    eventBus.trigger('shape.move', { elements, pos })
    eventBus.trigger('shape.tooltip.show')
  }

  /**
   *
   * @param {*} connection
   * @param {*} type
   * @param {*} x
   * @param {*} y
   */
  moveLinker(connection, type, x, y) {
    const { waypoint } = connection.plane
    const sourcePoint = waypoint[0]
    const targetPoint = waypoint[waypoint.length - 1]
    const shapeData = DrawUtils.getShapeByPosition(x, y, this.$container, true)

    let point = null
    let id = null

    eventBus.trigger('anchor.point.remove')
    if (shapeData != null) {
      const element = shapeData.element
      const { data, plane, shape } = element
      eventBus.trigger('anchor.show', element)

      id = data.id
      if (shapeData.type === 'bounds') {
        point = shapeData.anchor
        eventBus.trigger('anchor.point.show', setScale(point))
      } else {
        if (shapeData.type === 'shape') {
          var shapePoint
          var connectionPointId
          if (type === 'source') {
            shapePoint = { x: targetPoint.x, y: targetPoint.y }
            connectionPointId = connection.data.targetRef
          } else {
            shapePoint = { x: sourcePoint.x, y: sourcePoint.y }
            connectionPointId = connection.data.sourceRef
          }
          if (data.id === connectionPointId) {
            eventBus.trigger('anchor.point.remove')
            point = { x: restoreScale(x), y: restoreScale(y), angle: null }
            id = null
          } else {
            const anchors = shape.getAnchors()
            const center = {
              x: plane.bounds.x + plane.bounds.width / 2,
              y: plane.bounds.y + plane.bounds.height / 2
            }
            let num = -1
            let pos
            for (let i = 0; i < anchors.length; i += 1) {
              const anchor = anchors[i]
              const connectionPoint = DrawUtils.getRotated(
                center,
                { x: plane.bounds.x + anchor.x, y: plane.bounds.y + anchor.y },
                shape.shapeStyle.angle
              )
              const distance = DrawUtils.measureDistance(
                connectionPoint,
                shapePoint
              )
              if (num === -1 || distance < num) {
                num = distance
                pos = connectionPoint
              }
            }
            const angle = DrawUtils.getPointAngle(
              this.$container,
              data.id,
              pos.x,
              pos.y,
              7
            )
            point = { x: pos.x, y: pos.y, angle }
            eventBus.trigger('anchor.point.show', setScale(point))
          }
        }
      }
    } else {
      eventBus.trigger('anchor.point.remove')
      eventBus.trigger('anchor.remove')
      point = { x: restoreScale(x), y: restoreScale(y), angle: null }
      id = null
    }

    if (type === 'source') {
      connection.data.sourceRef = id
      sourcePoint.x = point.x
      sourcePoint.y = point.y
      sourcePoint.angle = point.angle
      if (id == null) {
        if (point.x >= targetPoint.x - 6 && point.x <= targetPoint.x + 6) {
          sourcePoint.x = targetPoint.x
        }
        if (point.y >= targetPoint.y - 6 && point.y <= targetPoint.y + 6) {
          sourcePoint.y = targetPoint.y
        }
      }
    } else {
      connection.data.targetRef = id
      targetPoint.x = point.x
      targetPoint.y = point.y
      targetPoint.angle = point.angle
      if (id == null) {
        if (point.x >= sourcePoint.x - 6 && point.x <= sourcePoint.x + 6) {
          targetPoint.x = sourcePoint.x
        }
        if (point.y >= sourcePoint.y - 6 && point.y <= sourcePoint.y + 6) {
          targetPoint.y = sourcePoint.y
        }
      }
    }

    eventBus.trigger('connection.render', {
      element: connection,
      rendered: true
    })
  }

  moveDom(element, restorePos, pos) {
    const { data, plane, shape } = element

    plane.bounds.x += restorePos.x
    plane.bounds.y += restorePos.y

    const $shape = this.$container.find('.shape-box[data-id="' + data.id + '"]')
    $shape.css({
      left: parseFloat($shape.css('left')) + pos.x,
      top: parseFloat($shape.css('top')) + pos.y
    })
  }
  /**
   * 销毁
   */
  destroy() {
    const $designer = this.$container.find('.bpd-designer')
    $designer.off('mousedown.drag').off('mousedown.dragconnection')
  }
}

export default ShapeMove
