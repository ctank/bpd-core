import eventBus from '../../core/eventBus'
import languages from './languages'

class I18n {
  constructor(local = 'zh_CN') {
    // 本地化
    this.local = local

    this.init()
  }

  init() {
    //
    eventBus.on('i18n', this.t.bind(this))
    //
    eventBus.on('i18n.change', this.change.bind(this))
  }

  t(key) {
    const keys = key.split('.')
    let obj = languages[this.local]
    for (let i = 0; i < keys.length; i += 1) {
      obj = obj[keys[i]]
    }
    return obj
  }

  change(local = 'zh_CN') {
    this.local = local
  }
}

export default I18n
