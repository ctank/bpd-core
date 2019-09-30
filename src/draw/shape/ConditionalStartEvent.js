import StartEvent from './StartEvent'
import eventBus from '../../core/eventBus'

class ConditionalStartEvent extends StartEvent {
  constructor(element, style = {}) {
    super(style)

    if (!element.data.name) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.ConditionalStartEvent')
    }

    this.eventDefinitionType = 'ConditionalEventDefinition'
  }
}

export default ConditionalStartEvent
