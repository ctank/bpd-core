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

  activateHand({ e, state }) {
    if (e && e.type === 'touchstart') {
      this.startHand(e)
    } else {
      this.$container
        .off('touchstart.hand mousedown.hand')
        .on('touchstart.hand mousedown.hand', e => {
          this.startHand(e)
          state.change('hand_move')
        })
    }
    $(document).off('touchend.hand mouseup.hand').on('touchend.hand mouseup.hand', () => {
      this.flag = false
      state.reset()
    })
  }

  startHand(e) {
    const scrollPos = {
      top: this.$container.scrollTop(),
      left: this.$container.scrollLeft()
    }
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
    this.moveHand(scrollPos, mousePos)
  }

  moveHand(scrollPos, mousePos) {
    const { pageStyle, $container } = this
    this.$container.off('touchmove.hand mousemove.hand').on('touchmove.hand mousemove.hand', e => {
      if (this.flag) {
        let newX = e.clientX - mousePos.x
        let newY = e.clientY - mousePos.y
        if (e.type.indexOf('touch') >= 0) {
          newX = e.originalEvent.targetTouches[0].clientX - mousePos.x
          newY = e.originalEvent.targetTouches[0].clientY - mousePos.y
        }

        let top = scrollPos.top - newY
        if (top < 0) {
          top = 0
        } else if (top > pageStyle.height - $container.height()) {
          top = pageStyle.height - $container.height()
        }

        let left = scrollPos.left - newX
        if (left < 0) {
          left = 0
        } else if (left > pageStyle.width - $container.width()) {
          left = pageStyle.width - $container.width()
        }
        this.$container.scrollTop(top)
        this.$container.scrollLeft(left)
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
