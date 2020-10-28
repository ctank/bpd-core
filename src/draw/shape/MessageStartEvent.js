import StartEvent from './StartEvent'
import eventBus from '../../core/eventBus'

class MessageStartEvent extends StartEvent {
  constructor(element, style = {}) {
    super(element, style)

    if (!element.data.name || element.data.name === eventBus.trigger('i18n', 'bpmn.StartEvent')) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.MessageStartEvent')
    }

    this.eventDefinitionType = 'MessageEventDefinition'

    this.groupName = 'StartEvent'
  }
}

export default MessageStartEvent
