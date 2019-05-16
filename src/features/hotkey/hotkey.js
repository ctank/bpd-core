import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import keyCodes from './keyCodes'

class HotKey {
  constructor() {
    this.funs = {
      Ctrl: {},
      Alt: {},
      Shift: {}
    }

    this.init()
    this.keyEvent()
  }

  init() {
    //
    eventBus.on('key.bind', this.bindKey.bind(this))

    eventBus.on('key.clear', this.clearKey.bind(this))
  }

  keyEvent() {
    $(document)
      .off('keydown.hotkey')
      .on('keydown.hotkey', e => {
        let funs = []
        if (e.ctrlKey) {
          funs = this.funs.Ctrl[e.keyCode] || []
        } else if (e.altKey) {
          funs = this.funs.Alt[e.keyCode] || []
        } else if (e.shiftKey) {
          funs = this.funs.Shift[e.keyCode] || []
        } else {
          funs = this.funs[e.keyCode] || []
        }
        for (let i = 0; i < funs.length; i += 1) {
          funs[i](e)
        }
        if (funs.length > 0) {
          e.preventDefault()
        }
      })

    $(document)
      .off('keydown.hotkey', 'input,textarea,select')
      .on('keydown.hotkey', 'input,textarea,select', function(e) {
        // 阻止冒泡
        e.stopPropagation()
      })
  }

  bindKey({ key, fun }) {
    const keys = key.split('+')
    if (keys.length === 1) {
      if (keys[0] === 'Ctrl' || keys[0] === 'Alt' || keys[0] === 'Shift') {
        console.log('error: ' + keys[0])
      } else {
        const keyCode = keyCodes[keys[0]]
        if (!this.funs[keyCode]) {
          this.funs[keyCode] = []
        }
        this.funs[keyCode].push(fun)
      }
    } else if (keys.length === 2) {
      if (keys[0] === 'Ctrl' || keys[0] === 'Alt' || keys[0] === 'Shift') {
        if (keys[1] !== 'Ctrl' && keys[1] !== 'Alt' && keys[1] !== 'Shift') {
          const obj = this.funs[keys[0]]
          const keyCode = keyCodes[keys[1]]
          if (!obj[keyCode]) {
            obj[keyCode] = []
          }
          obj[keyCode].push(fun)
        } else {
          console.log('组合键2错误')
        }
      } else {
        console.log('组合键1错误')
      }
    } else {
      console.log('组合键数量错误')
    }
  }

  clearKey() {
    this.cancel()
    this.funs = {
      Ctrl: {},
      Alt: {},
      Shift: {}
    }
  }

  cancel() {
    $(document).off('keydown.hotkey')
  }
}

export default HotKey
