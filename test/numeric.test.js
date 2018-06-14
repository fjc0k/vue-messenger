import { mount } from '@vue/test-utils'
import Messenger from '../src'

global.console.error = jest.fn(error => {
  throw new Error(error)
})

const getComponent = () => {
  return {
    template: `<child :count="count" />`,
    data: () => ({
      count: '1'
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
})

test('numeric unvalid', () => {
  expect(() => {
    wrapper.vm.count = '1@'
  }).toThrow(/custom validator check failed for prop "count"/)
  expect(() => {
    wrapper.vm.count = 11
  }).toThrow(/custom validator check failed for prop "count"/)
})
