import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

class Hand {
  constructor($container, pageStyle) {
    this.$container = $container

    this.pageStyle = pageStyle

    this.flag = false

    this.init()
  }

  init() {
    //
    eventBus.on('hand.activate', this.activateHand.bind(this))
    //
    eventBus.on('hand.move', this.moveHand.bind(this))
    //
    eventBus.on('hand.destroy', this.destroyHand.bind(this))
  }

  activateHand(e) {
    if (e && e.type === 'touchstart') {
      this.startHand(e)
    } else {
      this.$container
        .off('touchstart.hand mousedown.hand')
        .on('touchstart.hand mousedown.hand', e => {
          this.startHand(e)
        })
    }

    $(document).on('touchend.hand mouseup.hand', () => {
      this.flag = false
    })
  }

  startHand(e) {
    const $layout = this.$container.find('.bpd-layout')
    const layoutPos = $layout.position()
    const mousePos = {
      x: 0,
      y: 0
    }

    this.flag = true
    mousePos.x = e.clientX
    mousePos.y = e.clientY

    if (e.type.indexOf('touch') >= 0) {
      mousePos.x = e.originalEvent.targetTouches[0].clientX
      mousePos.y = e.originalEvent.targetTouches[0].clientY
    }

    this.moveHand(layoutPos, mousePos)
  }

  moveHand(layoutPos, mousePos) {
    const { pageStyle, $container } = this
    const $layout = $container.find('.bpd-layout')
    this.$container.on('touchmove.hand mousemove.hand', e => {
      if (this.flag) {
        let newX = e.clientX - mousePos.x
        let newY = e.clientY - mousePos.y
        if (e.type.indexOf('touch') >= 0) {
          newX = e.originalEvent.targetTouches[0].clientX - mousePos.x
          newY = e.originalEvent.targetTouches[0].clientY - mousePos.y
        }

        let top = layoutPos.top + newY
        if (top > 0) {
          top = 0
        } else if (top < -pageStyle.height) {
          top = -pageStyle.height + window.innerHeight
        }

        let left = layoutPos.left + newX
        if (left > 0) {
          left = 0
        } else if (left < -pageStyle.width) {
          left = -pageStyle.width + window.innerWidth
        }

        $layout.css({ top, left })
      }
    })
  }

  destroyHand() {
    this.$container.off(
      'mousedown.hand touchstart.hand mousemove.hand touchmove.hand'
    )
    $(document).off('mouseup.hand touchend.hand')
  }
}

export default Hand
