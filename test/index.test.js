import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import VueMessenger from '../src'

const getChild = (payload = {}) => ({
  name: 'child',
  mixins: [VueMessenger],
  props: {
    value: [String, Number],
    visible: {
      type: Boolean,
      sync: true
    },
    str: {
      type: Number,
      watch: true,
      transform: 'string'
    },
    num: {
      type: String,
      watch: true,
      transform: 'number'
    },
    int: {
      type: String,
      watch: true,
      transform: 'integer'
    },
    int16: {
      type: String,
      watch: true,
      transform: ['integer', 16]
    },
    date: {
      type: String,
      watch: true,
      transform: 'date'
    },
    func: {
      type: String,
      watch: true,
      transform() {
        return this.visible ? 1 : 0
      }
    },
    noTransform: {
      type: String,
      watch: true,
      transform: 'no'
    },
    nonsync: Boolean
  },
  template: '<div />',
  ...payload
})

const getParent = (payload, template) => ({
  name: 'parent',
  template: template || '<child v-model="value" :visible.sync="visible" />',
  data: () => ({
    value: '1',
    visible: true
  }),
  components: {
    Child: getChild(payload)
  }
})

test('calls onReceiveProp listeners immediately', () => {
  const onReceiveValueStub = sinon.stub()
  const onReceiveVisibleStub = sinon.stub()
  const onReceiveNonsyncStub = sinon.stub()

  mount(getParent({
    methods: {
      onReceiveValue: onReceiveValueStub,
      onReceiveVisible: onReceiveVisibleStub,
      onReceiveNonsync: onReceiveNonsyncStub
    }
  }))

  expect(onReceiveValueStub.calledOnceWith('1')).toBe(true)
  expect(onReceiveVisibleStub.calledOnceWith(true)).toBe(true)
  expect(onReceiveNonsyncStub.notCalled).toBe(true)
})

test('receives prop values immediately', () => {
  const wrapper = mount(getParent())

  const childData = wrapper.find({ name: 'child' }).vm.$data

  expect(childData.localValue).toBe('1')
  expect(childData.localVisible).toBe(true)
  expect(childData.localNonsync).toBe(undefined)
})

test('receives the changed values from the Parent component correctly', () => {
  const wrapper = mount(getParent())

  wrapper.setData({
    value: '2',
    visible: false
  })

  const childVM = wrapper.find({ name: 'child' }).vm

  expect(childVM.value).toBe('2')
  expect(childVM.visible).toBe(false)
  expect(childVM.localValue).toBe('2')
  expect(childVM.localVisible).toBe(false)
})

test('transforms values, then receives the changed values to the Parent component correctly', () => {
  const wrapper = mount(getParent({
    methods: {
      onReceiveValue(value, transformTo, oldValue, transformOldValueTo) {
        transformTo(Number(value) + 1)
        transformOldValueTo(Number(oldValue))
      },
      onReceiveVisible(visible, transformTo, oldVisible) {
        transformTo(
          oldVisible == null ? visible : oldVisible // eslint-disable-line
        )
      }
    }
  }))

  wrapper.setData({
    value: '2',
    visible: false
  })

  const childVM = wrapper.find({ name: 'child' }).vm

  expect(childVM.value).toBe('2')
  expect(childVM.visible).toBe(false)
  expect(childVM.localValue).toBe(3)
  expect(childVM.localVisible).toBe(true)
})

test('calls onSendProp listeners when calls sendProp methods', () => {
  const onSendValueStub = sinon.stub()
  const onSendVisibleStub = sinon.stub()

  const wrapper = mount(getParent({
    methods: {
      onSendValue: onSendValueStub,
      onSendVisible: onSendVisibleStub
    }
  }))

  const childVM = wrapper.find({ name: 'child' }).vm

  childVM.sendValue('2')
  childVM.sendVisible(false)

  expect(onSendValueStub.calledOnceWith('2')).toBe(true)
  expect(onSendVisibleStub.calledOnceWith(false)).toBe(true)
})

test('calls onSendProp listeners when assigns values to localProp data', () => {
  const onSendValueStub = sinon.stub()
  const onSendVisibleStub = sinon.stub()

  const wrapper = mount(getParent({
    methods: {
      onSendValue: onSendValueStub,
      onSendVisible: onSendVisibleStub
    }
  }))

  const child = wrapper.find({ name: 'child' })

  child.setData({
    localValue: '2',
    localVisible: false
  })

  expect(onSendValueStub.calledOnceWith('2')).toBe(true)
  expect(onSendVisibleStub.calledOnceWith(false)).toBe(true)
})

test('doesn\'t call onSendProp listeners if values haven\'t changed', () => {
  const onSendValueStub = sinon.stub()
  const onSendVisibleStub = sinon.stub()

  const wrapper = mount(getParent({
    methods: {
      onSendValue: onSendValueStub,
      onSendVisible: onSendVisibleStub
    }
  }))

  const child = wrapper.find({ name: 'child' })

  child.setData({
    localValue: '1'
  })
  child.vm.sendVisible(true)

  expect(onSendValueStub.notCalled).toBe(true)
  expect(onSendVisibleStub.notCalled).toBe(true)
})

test('sends the changed values to the Parent component correctly', () => {
  const wrapper = mount(getParent())

  const child = wrapper.find({ name: 'child' })

  child.setData({
    localValue: '2'
  })
  child.vm.sendVisible(true)

  expect(child.emitted().input.length).toBe(1)
  expect(child.emitted().input[0]).toEqual(['2', '1'])
  expect(child.emitted()['update:visible']).toBe(undefined)
  expect(wrapper.vm.value).toBe('2')
  expect(wrapper.vm.visible).toBe(true)
})

test('transforms values, then sends the changed values to the Parent component correctly', () => {
  const wrapper = mount(getParent({
    methods: {
      onSendValue(value, transformTo, oldValue, transformOldValueTo) {
        transformTo(Number(value) + 1)
        transformOldValueTo(Number(oldValue))
      },
      onSendVisible(visible, transformTo, oldVisible) {
        transformTo(oldVisible)
      }
    }
  }))

  const child = wrapper.find({ name: 'child' })

  child.setData({
    localValue: '2'
  })
  child.vm.sendVisible(false)

  expect(child.emitted().input.length).toBe(1)
  expect(child.emitted().input[0]).toEqual([3, 1])
  expect(child.emitted()['update:visible']).toBe(undefined)
  expect(wrapper.vm.value).toBe(3)
  expect(wrapper.vm.visible).toBe(true)
})

test('sends Event values correctly', () => {
  const wrapper = mount(getParent({
    template: '<input :value="localValue" @input="sendValue" />'
  }))
  const child = wrapper.find({ name: 'child' })
  const input = child.find('input')

  input.element.value = '2'
  input.trigger('input')

  expect(child.emitted().input.length).toBe(1)
  expect(child.emitted().input[0]).toEqual(['2', '1'])
  expect(wrapper.vm.value).toBe('2')
})

test('transform props correctly', () => {
  const wrapper = mount(getParent({}, `
    <child
      :str="567"
      num="88.1"
      int="-3.2"
      int16="0xF"
      date="2015-1-1"
      func="123"
      noTransform="80"
    />
  `))
  const data = wrapper.find({ name: 'child' }).vm.$data

  expect(data.localStr).toBe('567')
  expect(data.localNum).toBe(88.1)
  expect(data.localInt).toBe(-3)
  expect(data.localInt16).toBe(15)
  expect(data.localDate instanceof Date).toBe(true)
  expect(data.localDate.getFullYear()).toBe(2015)
  expect(data.localFunc).toBe(0)
  expect(data.localNoTransform).toBe('80')
})

// https://github.com/fjc0k/vue-messenger/issues/1
test('issue #1', () => {
  const wrapper = mount(getParent({ name: 'issue1' }, `
    <div>
      <child :visible.sync="visible" ref="c1" />
      <child :visible.sync="visible" ref="c2" />
    </div>
  `))
  const c1 = wrapper.find({ ref: 'c1' }).vm
  const c2 = wrapper.find({ ref: 'c2' }).vm

  expect(c1.localVisible).toBe(true)
  expect(c2.localVisible).toBe(true)

  c1.sendVisible(false)

  expect(c1.localVisible).toBe(false)
  expect(c2.localVisible).toBe(false)

  c2.sendVisible(true)

  expect(c1.localVisible).toBe(true)
  expect(c2.localVisible).toBe(true)

  c2.sendVisible(false)

  expect(c1.localVisible).toBe(false)
  expect(c2.localVisible).toBe(false)
})
