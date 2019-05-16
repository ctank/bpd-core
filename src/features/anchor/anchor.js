import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import { setScale, restoreScale } from '../../utils/utils'

const DEFAULT_CONFIG = {
  // 尺寸
  size: 8,
  // 颜色
  color: '#ec5343'
}

class ShapeAnchor {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.init()
  }

  init() {
    //
    eventBus.on('anchor.show', this.showAnchors.bind(this))
    //
    eventBus.on('anchor.remove', this.removeAnchors.bind(this))
    //
    eventBus.on('anchor.hover', this.hoverAnchors.bind(this))
    //
    eventBus.on('anchor.point.show', this.showAnchorPoint.bind(this))
    //
    eventBus.on('anchor.point.remove', this.hideAnchorPoint.bind(this))
    //
    eventBus.on('shape.move', this.moveAnchors.bind(this))
    // 删除图形
    eventBus.on('shape.select.remove', this.removeAnchors.bind(this))
    //
    eventBus.on('select.clear', this.removeAnchors.bind(this))
    //
    eventBus.on('destroy', this.destroy.bind(this))
  }

  /**
   *
   * @param {*} i
   */
  showAnchors(element) {
    const { config, $container } = this

    const { data, plane, shape } = element

    const orders = eventBus.trigger('orders.get')
    const selectIds = eventBus.trigger('shape.select.getIds')

    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    let $contour = $container.find('.shape-contour[data-id="' + data.id + '"]')
    if ($contour.length > 0) {
      return
    }

    $contour = $(
      "<div class='shape-contour' data-id='" + data.id + "'></div>"
    ).appendTo($designer)

    $contour.css({
      left: setScale(plane.bounds.x),
      top: setScale(plane.bounds.y),
      'z-index': orders.length + 1
    })

    if (!(selectIds.indexOf(data.id) >= 0)) {
      $contour.addClass('shape-contour-hover')
    }

    const size = config.size - 2
    const style = {
      'border-color': config.color,
      'border-radius': config.size / 2,
      width: size,
      height: size
    }
    const anchors = shape.getAnchors()
    const center = { x: plane.bounds.width / 2, y: plane.bounds.height / 2 }
    for (let i = 0; i < anchors.length; i += 1) {
      const anchor = anchors[i]
      const $anchor = $("<div class='shape-anchor'></div>").appendTo($contour)
      const pos = DrawUtils.getRotated(center, anchor, shape.shapeStyle.angle)
      style.left = setScale(pos.x) - config.size / 2
      style.top = setScale(pos.y) - config.size / 2
      $anchor.css(style)
    }
  }
  /**
   * 移动锚点
   * @param {*} data
   */
  moveAnchors({ elements, pos }) {
    for (let i = 0; i < elements.length; i++) {
      const { data, plane, shape } = elements[i]
      if (shape.bpmnName !== 'SequenceFlow') {
        this.$container.find('.shape-contour[data-id=' + data.id + ']').css({
          left: setScale(plane.bounds.x),
          top: setScale(plane.bounds.y)
        })
      }
    }
  }
  hideAnchors() {
    this.$container.find('.shape-contour-hover').remove()
  }
  removeAnchors() {
    this.$container.find('.shape-contour').remove()
  }

  hoverAnchors({ state, element, anchor }) {
    const { config, $container } = this
    const { data, plane, shape } = element

    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    const self = this

    $layout.off('mousedown.connection').on('mousedown.connection', function(e) {
      state.change('link_shape')
      var f = null
      let connection = null
      let anchorData
      if (!element) {
        const mousePos = DrawUtils.getRelativePos(e.pageX, e.pageY, $designer)
        anchorData = {
          x: restoreScale(mousePos.x),
          y: restoreScale(mousePos.y),
          id: null,
          angle: null
        }
      } else {
        anchorData = anchor
        anchorData.id = data.id
      }
      $layout.on('mousemove.connection', function(e) {
        $layout.css('cursor', 'default')
        const mousePos = DrawUtils.getRelativePos(e.pageX, e.pageY, $designer)
        if (connection == null) {
          connection = self.createConnection(anchorData, mousePos)
        }
        eventBus.trigger('connection.move', {
          element: connection,
          type: 'target',
          x: mousePos.x,
          y: mousePos.y
        })

        $(document)
          .off('mouseup.dropConnection')
          .on('mouseup.dropConnection', function() {
            if (
              Math.abs(mousePos.x - anchorData.x) > 20 ||
              Math.abs(mousePos.y - anchorData.y) > 20
            ) {
              eventBus.trigger('element.add', connection)
              if (
                connection.data.targetRef == null &&
                connection.data.sourceRef != null
              ) {
                eventBus.trigger('group.connection.show', connection)
              }
            } else {
              $container
                .find('.shape-box[data-id="' + connection.data.id + '"]')
                .remove()
            }
            $(document).off('mouseup.dropConnection')
          })
      })
      $(document).on('mouseup.connection', function() {
        eventBus.trigger('anchor.point.remove')
        state.reset()
        $layout.off('mousedown.connection')
        $layout.off('mousemove.connection')
        $(document).off('mouseup.connection')
      })
    })
  }

  showAnchorPoint(pos) {
    const { config, $container } = this
    const orders = eventBus.trigger('orders.get')

    const $designer = $container.find('.bpd-designer')
    let $point = $designer.find('.anchor-point')
    if ($point.length === 0) {
      $point = $(
        "<canvas class='anchor-point' width=32 height=32></canvas>"
      ).appendTo($designer)
      const point2d = $point[0].getContext('2d')
      point2d.translate(1, 1)
      point2d.lineWidth = 1
      point2d.globalAlpha = 0.3
      point2d.strokeStyle = config.color
      point2d.fillStyle = config.color
      point2d.beginPath()
      point2d.moveTo(0, 15)
      point2d.bezierCurveTo(0, -5, 30, -5, 30, 15)
      point2d.bezierCurveTo(30, 35, 0, 35, 0, 15)
      point2d.closePath()
      point2d.fill()
      point2d.stroke()
    }
    $point
      .css({
        left: pos.x - 16,
        top: pos.y - 16,
        'z-index': orders.length
      })
      .show()
  }

  hideAnchorPoint() {
    this.$container.find('.anchor-point').remove()
  }

  createConnection(source, target) {
    const element = eventBus.trigger('element.create', {
      name: '',
      type: 'SequenceFlow',
      prefix: 'obj'
    })

    const { data, plane } = element

    data.sourceRef = source.id
    if (plane.waypoint.length > 1) {
      plane.waypoint[plane.waypoint.length - 1] = {
        $type: 'dc:Point',
        x: target.x,
        y: target.y,
        angle: null
      }
    } else {
      plane.waypoint[0] = {
        $type: 'dc:Point',
        x: source.x,
        y: source.y,
        angle: source.angle
      }

      plane.waypoint[1] = {
        $type: 'dc:Point',
        x: target.x,
        y: target.y,
        angle: null
      }
    }

    eventBus.trigger('connection.render', { element })
    return element
  }

  /**
   * 销毁
   */
  destroy() {
    this.hideAnchors()
  }
}

export default ShapeAnchor
