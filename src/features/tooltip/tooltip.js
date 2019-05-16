import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import { setScale, restoreScale } from '../../utils/utils'

const DEFAULT_CONFIG = {}

class Tooltip {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.init()
  }

  init() {
    //
    eventBus.on('shape.tooltip.show', this.showTooltip.bind(this))
    //
    eventBus.on('shape.tooltip.hide', this.hideTooltip.bind(this))
  }

  showTooltip(html) {
    const { $container } = this
    const $designer = $container.find('.bpd-designer')
    const $select = $designer.find('.shape-select')
    const pos = $select.position()
    const orders = eventBus.trigger('orders.get')

    let $tooltip = $designer.find('.shape-tooltip')
    if ($tooltip.length === 0) {
      $tooltip = $("<div class='shape-tooltip'></div>").appendTo($designer)
    }

    if (!html) {
      html =
        'X: ' +
        Math.round(restoreScale(pos.left)) +
        '&nbsp;&nbsp;Y: ' +
        Math.round(restoreScale(pos.top))
    }

    $tooltip.html(html)

    $tooltip
      .css({
        top: pos.top + $select.height() + 5,
        left: pos.left + $select.width() / 2 - $tooltip.outerWidth() / 2,
        'z-index': orders.length
      })
      .show()
  }

  hideTooltip() {
    this.$container.find('.shape-tooltip').hide()
  }
}

export default Tooltip
