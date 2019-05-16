import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import { setScale, restoreScale } from '../../utils/utils'

const DEFAULT_CONFIG = {}

class Snapline {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.init()
  }

  init() {
    //
    eventBus.on('shape.snapline.show', this.showSnapLine.bind(this))
    //
    eventBus.on('shape.snapline.hide', this.hideSnapLine.bind(this))
  }

  /**
   *
   * @param {*} size
   * @param {*} ids
   * @param {*} render
   * @param {*} element
   */
  renderSnapLine(size, ids, render, element) {
    const { $container } = this
    const orders = eventBus.trigger('orders.get')
    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    const top = size.y
    const bottom = size.y + size.height
    const left = size.x
    const right = size.x + size.width
    const centerX = size.x + size.width / 2
    const centerY = size.y + size.height / 2

    var f = 2
    const snapData = { v: null, h: null, attach: null }
    if (!render) {
      element = eventBus.trigger('element.get', ids[0])
    }

    if (ids.length === 1 && element.shape.groupName === 'boundaryEvent') {
      // TODO:边界事件
    }
    if (snapData.attach == null) {
      for (let i = orders.length - 1; i >= 0; i--) {
        const id = orders[i].id
        const el = eventBus.trigger('element.get', id)

        const { data, plane, shape } = el

        if (
          shape.bpmnName === 'SequenceFlow' ||
          ids.indexOf(id) >= 0 ||
          shape.parent
        ) {
          continue
        }

        const bounds = plane.bounds

        if (snapData.h == null) {
          const shapeTop = bounds.y
          const shapeCenterY = bounds.y + bounds.height / 2
          const shapeBottom = bounds.y + bounds.height
          if (shapeCenterY >= centerY - f && shapeCenterY <= centerY + f) {
            snapData.h = { type: 'middle', y: shapeCenterY }
            size.y = shapeCenterY - size.height / 2
          } else {
            if (shapeTop >= top - f && shapeTop <= top + f) {
              snapData.h = { type: 'top', y: shapeTop }
              size.y = shapeTop
            } else {
              if (shapeBottom >= bottom - f && shapeBottom <= bottom + f) {
                snapData.h = { type: 'bottom', y: shapeBottom }
                size.y = shapeBottom - size.height
              } else {
                if (shapeBottom >= top - f && shapeBottom <= top + f) {
                  snapData.h = { type: 'top', y: shapeBottom }
                  size.y = shapeBottom
                } else {
                  if (shapeTop >= bottom - f && shapeTop <= bottom + f) {
                    snapData.h = { type: 'bottom', y: shapeTop }
                    size.y = shapeTop - size.height
                  }
                }
              }
            }
          }
        }
        if (snapData.v == null) {
          const shapeLeft = bounds.x
          const shapeCenterX = bounds.x + bounds.width / 2
          const shapeRight = bounds.x + bounds.width
          if (shapeCenterX >= centerX - f && shapeCenterX <= centerX + f) {
            snapData.v = { type: 'center', x: shapeCenterX }
            size.x = shapeCenterX - size.width / 2
          } else {
            if (shapeLeft >= left - f && shapeLeft <= left + f) {
              snapData.v = { type: 'left', x: shapeLeft }
              size.x = shapeLeft
            } else {
              if (shapeRight >= right - f && shapeRight <= right + f) {
                snapData.v = { type: 'right', x: shapeRight }
                size.x = shapeRight - size.width
              } else {
                if (shapeRight >= left - f && shapeRight <= left + f) {
                  snapData.v = { type: 'left', x: shapeRight }
                  size.x = shapeRight
                } else {
                  if (shapeLeft >= right - f && shapeLeft <= right + f) {
                    snapData.v = { type: 'right', x: shapeLeft }
                    size.x = shapeLeft - size.width
                  }
                }
              }
            }
          }
        }
        if (snapData.h != null && snapData.v != null) {
          break
        }
      }
    }
    this.hideSnapLine()

    if (snapData.attach != null) {
      let $snapLine = $designer.find('.snapline-attach')
      if ($snapLine.length === 0) {
        $snapLine = $("<div class='snapline-attach'></div>").appendTo($designer)
      }
      var x = snapData.attach
      var a = x.lineStyle.lineWidth
      $snapLine
        .css({
          width: setScale(x.props.w + a),
          height: setScale(x.props.h + a),
          left: setScale(x.props.x - a / 2) - 2,
          top: setScale(x.props.y - a / 2) - 2,
          'z-index': $('#' + x.id).css('z-index')
        })
        .show()
    }

    if (snapData.h != null) {
      let $snapLineH = $designer.find('.snapline-attach-h')

      if ($snapLineH.length === 0) {
        $snapLineH = $("<div class='snapline-attach-h'></div>").appendTo(
          $designer
        )
      }
      $snapLineH
        .css({
          width: $designer.width(),
          left: 0,
          top: Math.round(setScale(snapData.h.y)),
          'z-index': orders.length + 1
        })
        .show()
    }
    if (snapData.v != null) {
      let $snapLineV = $designer.find('.snapline-attach-v')
      if ($snapLineV.length === 0) {
        $snapLineV = $("<div class='snapline-attach-v'></div>").appendTo(
          $designer
        )
      }
      $snapLineV
        .css({
          height: $designer.height(),
          top: 0,
          left: Math.round(setScale(snapData.v.x)),
          'z-index': orders.length + 1
        })
        .show()
    }
    return snapData
  }

  showSnapLine({ size, ids, render, element }) {
    this.renderSnapLine(size, ids, render, element)
  }

  hideSnapLine() {
    const { $container } = this
    const $designer = $container.find('.bpd-designer')
    $designer.find('.snapline-attach-h').hide()
    $designer.find('.snapline-attach-v').hide()
    $designer.find('.snapline-attach').hide()
  }
}

export default Snapline
