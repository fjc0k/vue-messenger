import { mount } from '@vue/test-utils'
import Messenger from '../src'

global.console.error = jest.fn(error => {
  throw new Error(error)
})

const getComponent = () => {
  return {
    template: `<child :type="type" />`,
    data: () => ({
      type: 'primary'
    }),
    components: {
      child: {
        name: 'child',
        mixins: [Messenger],
        template: `<div />`,
        props: {
          type: {
            type: String,
            enum: ['default', 'primary', 'danger']
          },
          size: {
            type: String,
            enum: ['lg', 'sm', 'xs'],
            default: 'sm'
          }
        }
      }
    }
  }
}

const wrapper = mount(getComponent())
const child = wrapper.find({ name: 'child' })

test('enum valid', () => {
  expect(child.vm.type).toEqual('primary')
  expect(child.vm.size).toEqual('sm')
})

test('enum unvalid', () => {
  expect(() => {
    wrapper.vm.type = 'test'
  }).toThrow(/custom validator check failed for prop "type"/)
})
