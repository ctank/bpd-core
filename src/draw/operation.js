import eventBus from '../core/eventBus'
import DrawUtils from './drawUtils'

class Operation {
  constructor() {
    this.state = {
      state: null,
      reset: this.resetState.bind(this),
      change: this.changeState.bind(this)
    }

    this.canvasDragTimeout = null
  }
  /**
   * 注销事件
   */
  destroy() {
    if (this.$container) {
      const $layout = this.$container.find('.bpd-layout')
      const $designer = this.$container.find('.bpd-designer')

      $designer.off('mousedown.multiselect')

      $layout
        .off('mousedown.connection')
        .off('mousedown.createText')
        .off('mousedown.dragCanvas')

      eventBus.trigger('destroy')
    }
  }

  /**
   * 只读的设计器支持链接操作
   */
  cancel() {
    this.destroy()
  }

  /**
   * 画布鼠标移动事件
   * @param {*} e
   */
  move(e) {
    const { $container } = this
    if ($container) {
      const $designer = $container.find('.bpd-designer')
      const data = {
        state: this.state
      }
      if (this.state.state != null) {
        return
      }


      this.destroy()

      const mousePos = DrawUtils.getRelativePos(e.pageX, e.pageY, $container)
      const shapeData = DrawUtils.getShapeByPosition(
        mousePos.x,
        mousePos.y,
        $container
      )

      if (shapeData != null && !this.options.readonly) {
        eventBus.trigger('hand.destroy')

        data.element = shapeData.element
        data.anchor = shapeData.anchor
        data.point = shapeData.point

        if (shapeData.type === 'sequence') {
          $designer.css('cursor', 'pointer')
          eventBus.trigger('shape.hover', data)

          const element = shapeData.element
          const pointIndex = shapeData.pointIndex

          if (
            element.shape.linkerType === 'broken' &&
            pointIndex > 1 &&
            pointIndex <= element.shape.points.length
          ) {
          } else {
            if (
              element.data.sourceRef == null &&
              element.data.targetRef == null
            ) {
              $designer.css('cursor', 'move')
              eventBus.trigger('shape.drag', data)
            }
          }
        } else {
          if (shapeData.type === 'sequence_point') {
            $designer.css('cursor', 'move')
            eventBus.trigger('shape.hover', data)
            eventBus.trigger('connection.drag', data)
          } else {
            if (shapeData.type === 'sequence_text') {
              $designer.css('cursor', 'text')
              eventBus.trigger('shape.hover', data)
            } else {
              if (shapeData.type === 'shape') {
                if (shapeData.element.shape.locked) {
                  $designer.css('cursor', 'default')
                  eventBus.trigger('shape.hover', data)
                } else {
                  $designer.css('cursor', 'move')
                  eventBus.trigger('shape.hover', data)
                  eventBus.trigger('shape.edit', data)
                  eventBus.trigger('shape.drag', data)
                }
              } else {
                $designer.css('cursor', 'crosshair')
                eventBus.trigger('shape.hover', data)
                eventBus.trigger('anchor.hover', data)
              }
              if (shapeData.element.shape.parent) {
                const parent = eventBus.on(
                  'element.get',
                  shapeData.element.shape.parent
                )
                eventBus.trigger('anchor.show', parent)
              } else {
                eventBus.trigger('anchor.show', shapeData.element)
              }
            }
          }
        }
      } else {
        $designer.css('cursor', 'default')
        eventBus.trigger('shape.multiSelect', data)
        eventBus.trigger('hand.activate', { e, state: data.state })
      }
    }
  }
  /**
   * 修改状态
   * @param {*} state
   */
  changeState(state) {
    this.state.state = state
  }
  /**
   * 还愿状态
   */
  resetState() {
    this.state.state = null
    const $designer = this.$container.find('.bpd-designer')
    $designer.css('cursor', 'default')
  }
}

export default Operation
