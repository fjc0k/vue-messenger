import { mount } from '@vue/test-utils'
import Messenger from '../src'

const getComponent = () => {
  return {
    template: `<child v-model="size" :flag.sync="flag" />`,
    data: () => ({
      size: 'lg',
      flag: 0
    }),
    components: {
      child: {
        name: 'child',
        model: {
          prop: 'size',
          event: 'input'
        },
        mixins: [Messenger],
        template: `<div />`,
        props: {
          size: {
            type: String,
            transform: value => ({
              lg: 'large',
              sm: 'small'
            }[value])
          },
          flag: {
            type: Number,
            sync: true,
            transform: {
              receive: Boolean,
              send: Number
            }
          }
        }
      }
    }
  }
}

const wrapper = mount(getComponent())
const child = wrapper.find({ name: 'child' })

test('size: lg ==> localSize: large', () => {
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localSize: 'large'
    })
  )
})

test('size: sm ==> localSize: small', () => {
  wrapper.vm.size = 'sm'
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localSize: 'small'
    })
  )
})

test('flag: 0 ==> localFlag: false', () => {
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localFlag: false
    })
  )
})

test('flag: 1 ==> localFlag: true', () => {
  wrapper.vm.flag = 1
  expect(child.vm.$data).toEqual(
    expect.objectContaining({
      localFlag: true
    })
  )
})

test('localFlag: false ==> flag: 0', () => {
  child.vm.localFlag = false
  expect(wrapper.vm.$data).toEqual(
    expect.objectContaining({
      flag: 0
    })
  )
})

test('don\'t apply transformations to nil values', () => {
  child.vm.localFlag = null
  expect(wrapper.vm.$data).toEqual(
    expect.objectContaining({
      flag: null
    })
  )
  child.vm.localFlag = undefined
  expect(wrapper.vm.$data).toEqual(
    expect.objectContaining({
      flag: undefined
    })
  )
})
