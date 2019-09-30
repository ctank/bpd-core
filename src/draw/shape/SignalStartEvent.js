import StartEvent from './StartEvent'
import eventBus from '../../core/eventBus'

class SignalStartEvent extends StartEvent {
  constructor(element, style = {}) {
    super(style)

    if (!element.data.name) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.SignalStartEvent')
    }

    this.eventDefinitionType = 'SignalEventDefinition'
  }
}

export default SignalStartEvent
