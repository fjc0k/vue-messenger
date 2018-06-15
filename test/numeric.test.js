import { mount } from '@vue/test-utils'
import Messenger from '../src'

global.console.error = jest.fn(error => {
  throw new Error(error)
})

const getComponent = () => {
  return {
    template: `<child :count="count" :infinity="infinity" :range="range" />`,
    data: () => ({
      count: '1',
      infinity: 1,
      range: 0.5
    }),
    components: {
      child: {
        name: 'child',
        mixins: [Messenger],
        template: `<div />`,
        props: {
          count: {
            numeric: true,
            validator: value => value <= 10
          },
          infinity: {
            numeric: true,
            infinite: true
          },
          range: {
            numeric: true,
            range: [0, 1]
          }
        }
      }
    }
  }
}

const wrapper = mount(getComponent())
const child = wrapper.find({ name: 'child' })

test('numeric valid', () => {
  expect(child.vm.count).toEqual('1')
  wrapper.vm.count = 10
  expect(child.vm.count).toEqual(10)
  wrapper.vm.infinity = -Infinity
  expect(child.vm.infinity).toEqual(-Infinity)
  wrapper.vm.infinity = Infinity
  expect(child.vm.infinity).toEqual(Infinity)
  wrapper.vm.range = 1
  expect(child.vm.range).toEqual(1)
})

test('numeric unvalid', () => {
  expect(() => {
    wrapper.vm.count = '1@'
  }).toThrow(/custom validator check failed for prop "count"/)
  wrapper.vm.count = '1'
  expect(() => {
    wrapper.vm.count = 11
  }).toThrow(/custom validator check failed for prop "count"/)
  wrapper.vm.count = '1'
  expect(() => {
    wrapper.vm.count = Infinity
  }).toThrow(/custom validator check failed for prop "count"/)
  wrapper.vm.count = '1'
  expect(() => {
    wrapper.vm.range = 1.0001
  }).toThrow(/custom validator check failed for prop "range"/)
  wrapper.vm.range = 1
  expect(() => {
    wrapper.vm.range = -0.0000001
  }).toThrow(/custom validator check failed for prop "range"/)
})
