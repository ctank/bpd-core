import StartEvent from './StartEvent'
import eventBus from '../../core/eventBus'

class MessageStartEvent extends StartEvent {
  constructor(element, style = {}) {
    super(style)

    if (!element.data.name) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.MessageStartEvent')
    }

    this.eventDefinitionType = 'MessageEventDefinition'
  }
}

export default MessageStartEvent
