import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Messenger from '../src'

const getComponent = (on = {}) => {
  return {
    template: `<child v-model="value" :visible.sync="visible" />`,
    data: () => ({
      value: 'foo',
      visible: false
    }),
    components: {
      child: {
        name: 'child',
        mixins: [Messenger],
        template: `<div />`,
        props: {
          value: {
            type: String,
            on: on.value
          },
          visible: {
            type: Boolean,
            sync: true,
            on: on.visible
          }
        }
      }
    }
  }
}

test('immediately call onReceive & onChange', () => {
  const on = {
    value: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    },
    visible: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    }
  }
  mount(getComponent(on))
  expect(on.value.receive.calledOnceWith('foo')).toBe(true)
  expect(on.value.send.notCalled).toBe(true)
  expect(on.value.change.calledOnceWith('foo')).toBe(true)
  expect(on.visible.receive.calledOnceWith(false)).toBe(true)
  expect(on.visible.send.notCalled).toBe(true)
  expect(on.visible.change.calledOnceWith(false)).toBe(true)
})

test('change data to trigger onReceive & onChange', () => {
  const on = {
    value: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    },
    visible: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    }
  }
  const wrapper = mount(getComponent(on))
  expect(on.value.receive.calledOnceWith('foo')).toBe(true)
  expect(on.value.send.notCalled).toBe(true)
  expect(on.value.change.calledOnceWith('foo')).toBe(true)
  expect(on.visible.receive.calledOnceWith(false)).toBe(true)
  expect(on.visible.send.notCalled).toBe(true)
  expect(on.visible.change.calledOnceWith(false)).toBe(true)
  wrapper.vm.value = 'bar'
  expect(on.value.receive.calledTwice).toBe(true)
  expect(on.value.send.notCalled).toBe(true)
  expect(on.value.change.calledTwice).toBe(true)
  expect(on.visible.receive.calledOnceWith(false)).toBe(true)
  expect(on.visible.send.notCalled).toBe(true)
  expect(on.visible.change.calledOnceWith(false)).toBe(true)
})

test('change localData to trigger onSend & onChange', () => {
  const on = {
    value: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    },
    visible: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    }
  }
  const wrapper = mount(getComponent(on))
  const child = wrapper.find({ name: 'child' })
  expect(on.value.receive.calledOnceWith('foo')).toBe(true)
  expect(on.value.send.notCalled).toBe(true)
  expect(on.value.change.calledOnceWith('foo')).toBe(true)
  expect(on.visible.receive.calledOnceWith(false)).toBe(true)
  expect(on.visible.send.notCalled).toBe(true)
  expect(on.visible.change.calledOnceWith(false)).toBe(true)
  child.vm.localValue = 'bar'
  expect(on.value.receive.calledOnce).toBe(true)
  expect(on.value.send.calledOnceWith('bar')).toBe(true)
  expect(on.value.change.calledTwice).toBe(true)
  expect(on.visible.receive.calledOnceWith(false)).toBe(true)
  expect(on.visible.send.notCalled).toBe(true)
  expect(on.visible.change.calledOnceWith(false)).toBe(true)
})

test('prevent default', () => {
  const on = {
    value: {
      receive: value => value !== 'test',
      send: value => value !== 'test1',
      change: value => value !== 'testAll'
    },
    visible: {
      receive: sinon.stub(),
      send: sinon.stub(),
      change: sinon.stub()
    }
  }
  const wrapper = mount(getComponent(on))
  const child = wrapper.find({ name: 'child' })
  wrapper.vm.value = 'bar'
  expect(child.vm.localValue).toBe('bar')
  wrapper.vm.value = 'test'
  expect(child.vm.localValue).toBe('bar')
  child.vm.localValue = 'test1'
  expect(wrapper.vm.value).toBe('test')
  wrapper.vm.value = 'testAll'
  expect(child.vm.localValue).toBe('test1')
  wrapper.vm.value = '123'
  child.vm.localValue = 'testAll'
  expect(wrapper.vm.value).toBe('123')
})
