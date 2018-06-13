import { upperCaseFirst, isFunction, isObject } from './utils'

const defaultModel = {
  prop: 'value',
  event: 'input'
}

export default {
  beforeCreate() {
    if (this.__MessengerBeforeCreate__) return

    this.__MessengerBeforeCreate__ = true

    const options = this.$options

    if (!options.localDataKeys) options.localDataKeys = []
    if (!options.methods) options.methods = {}
    if (!options.watch) options.watch = {}

    const model = options.model || defaultModel

    const props = options.props

    for (const prop of Object.keys(props)) {
      const descriptor = props[prop]

      // enum
      if (Array.isArray(descriptor.enum)) {
        descriptor.validator = value => descriptor.enum.indexOf(value) >= 0
        if (!('default' in descriptor)) {
          descriptor.default = descriptor.enum[0]
        }
      }

      const isModelProp = prop === model.prop

      const event = isModelProp ? model.event : `update:${prop}`
      const shouldEmit = isModelProp || !!descriptor.sync
      const shouldTransform = !!descriptor.transform
      const shouldProcess = shouldEmit || shouldTransform

      if (!shouldProcess) return

      let receiveTransform
      let sendTransform
      const transform = descriptor.transform
      if (isFunction(transform)) {
        receiveTransform = transform
      } else if (isObject(transform)) {
        if (isFunction(transform.receive)) {
          receiveTransform = transform.receive
        }
        if (isFunction(transform.send)) {
          sendTransform = transform.send
        }
      }

      let onReceive
      let onSend
      let onChange
      const on = descriptor.on
      if (isObject(on)) {
        if (isFunction(on.receive)) {
          onReceive = on.receive
        }
        if (isFunction(on.send)) {
          onSend = on.send
        }
        if (isFunction(on.change)) {
          onChange = on.change
        }
      }

      const Prop = upperCaseFirst(prop)
      const localProp = `local${Prop}`
      const lastProp = `last${Prop}$$`
      const lastLocalProp = `lastLocal${Prop}$$`
      const sendProp = `send${Prop}`

      options.localDataKeys.push(localProp)

      options.watch[prop] = {
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue === oldValue || newValue === this[lastLocalProp]) {
            this[lastProp] = newValue
            return
          }

          if (receiveTransform && newValue != null) {
            newValue = receiveTransform.call(this, newValue)

            if (newValue === oldValue || newValue === this[lastLocalProp]) return
          }

          if (onReceive) {
            if (onReceive.call(this, newValue, oldValue) === false) {
              return
            }
          }

          if (onChange) {
            if (onChange.call(this, newValue, oldValue) === false) {
              return
            }
          }

          this[lastProp] = newValue

          this[localProp] = newValue
        }
      }

      options.watch[localProp] = {
        immediate: false,
        handler(newValue, oldValue) {
          if (newValue === oldValue || newValue === this[lastProp]) {
            this[lastLocalProp] = newValue
            return
          }

          if (sendTransform && newValue != null) {
            newValue = sendTransform.call(this, newValue)

            if (newValue === oldValue || newValue === this[lastProp]) return
          }

          if (onSend) {
            if (onSend.call(this, newValue, oldValue) === false) {
              return
            }
          }

          if (onChange) {
            if (onChange.call(this, newValue, oldValue) === false) {
              return
            }
          }

          this[lastLocalProp] = newValue

          if (shouldEmit) {
            this.$emit(event, newValue, oldValue)
          }
        }
      }

      if (!shouldEmit) return

      options.methods[sendProp] = function (newValue) {
        this[localProp] = newValue
      }
    }
  },

  data() {
    if (this.__MessengerData__) return

    this.__MessengerData__ = true

    return this.$options.localDataKeys.reduce((data, key) => {
      data[key] = null
      return data
    }, {})
  }
}
