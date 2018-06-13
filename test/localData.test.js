import { mount } from '@vue/test-utils'
import Messenger from '../src'

const getComponent = () => {
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
          value: String,
          visible: {
            type: Boolean,
            sync: true
          }
        }
      }
    }
  }
}

const wrapper = mount(getComponent())
const child = wrapper.find({ name: 'child' })

test('child has correct localData', () => {
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localValue: 'foo',
      localVisible: false
    })
  )
})

test('change parent data to update child localData', () => {
  wrapper.setData({
    value: 'bar',
    visible: true
  })
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localValue: 'bar',
      localVisible: true
    })
  )
})

test('change child localData to update parent data', () => {
  child.vm.$data.localValue = 'foo'
  child.vm.$data.localVisible = false
  expect(wrapper.vm.$data).toEqual(
    expect.objectContaining({
      value: 'foo',
      visible: false
    })
  )
})

test('use sendProp to update parent data', () => {
  child.vm.sendValue('bar')
  child.vm.sendVisible(true)
  expect(wrapper.vm.$data).toEqual(
    expect.objectContaining({
      value: 'bar',
      visible: true
    })
  )
})

