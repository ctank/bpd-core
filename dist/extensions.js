var Extension = {
  name: 'T',
  uri: 'http://xxx.com/bpmn',
  prefix: 't',
  types: [
    {
      name: 'test1',
      superClass: ['Element'],
      properties: [
        {
          name: 'value',
          isBody: true,
          type: 'String'
        }
      ]
    },
    {
      name: 'test2',
      superClass: ['Element'],
      properties: [
        {
          name: 'type',
          type: 'String',
          isAttr: true
        },
        {
          name: 'value',
          isBody: true,
          type: 'String'
        }
      ]
    }
  ],
  emumerations: [],
  associations: []
}
