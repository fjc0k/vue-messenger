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
    nonsync: Boolean
  },
  template: '<div />',
  ...payload
})

const getParent = payload => ({
  name: 'parent',
  template: '<child v-model="value" :visible.sync="visible" />',
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
