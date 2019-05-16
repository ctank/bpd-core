import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import { setScale, restoreScale } from '../../utils/utils'

const DEFAULT_CONFIG = {
  show: true,
  size: 15
}

class Background {
  constructor($container, options, config) {
    this.$container = $container

    this.options = options

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.renderBG()
  }

  renderBG() {
    const { $container, options, config } = this

    if (config.show) {
      const pageWidth = options.pageStyle.width
      const pageHeight = options.pageStyle.height

      const pageBackGroundColor = options.pageStyle.backgroundColor
      const darkerBGColor = DrawUtils.getDarkerColor(pageBackGroundColor)
      const darkestBGColor = DrawUtils.getDarkestColor(pageBackGroundColor)

      const $designer = $container.find('.bpd-designer')

      let $bg = $designer.find('.shape-background')
      if ($bg.length === 0) {
        $bg = $('<canvas class="shape-background"></canvas>').appendTo(
          $designer
        )
      }

      $bg.attr({ width: pageWidth, height: pageHeight })
      const canvas2D = $bg[0].getContext('2d')
      canvas2D.clearRect(0, 0, pageWidth, pageHeight)

      let padding = 0
      let contentWidth = pageWidth - padding * 2
      let contentHeight = pageHeight - padding * 2

      canvas2D.fillStyle = 'rgb(' + pageBackGroundColor + ')'
      canvas2D.beginPath()
      canvas2D.rect(padding, padding, contentWidth, contentHeight)
      canvas2D.fill()
      // 画网格
      let gridSize = Math.round(setScale(config.size))
      if (gridSize < 10) {
        gridSize = 10
      }

      canvas2D.translate(padding, padding)
      canvas2D.lineWidth = 1
      canvas2D.save()

      let j = 0.5
      let i = 0
      while (j <= contentHeight) {
        canvas2D.restore()
        if (i % 4 === 0) {
          canvas2D.strokeStyle = 'rgb(' + darkestBGColor + ')'
        } else {
          canvas2D.strokeStyle = 'rgb(' + darkerBGColor + ')'
        }
        canvas2D.beginPath()
        canvas2D.moveTo(0, j)
        canvas2D.lineTo(contentWidth, j)
        j += gridSize
        i++
        canvas2D.stroke()
      }
      j = 0.5
      i = 0
      while (j <= contentWidth) {
        canvas2D.restore()
        if (i % 4 === 0) {
          canvas2D.strokeStyle = 'rgb(' + darkestBGColor + ')'
        } else {
          canvas2D.strokeStyle = 'rgb(' + darkerBGColor + ')'
        }
        canvas2D.beginPath()
        canvas2D.moveTo(j, 0)
        canvas2D.lineTo(j, contentHeight)
        j += gridSize
        i++
        canvas2D.stroke()
      }
    }
  }
}

export default Background
