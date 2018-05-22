/* eslint guard-for-in: 0 */
import { isFunction, upperCaseFirst } from './utils'

export default {
  beforeCreate() {
    const ctx = this.$options

    // Normalize options.
    if (!ctx.localDataKeys) ctx.localDataKeys = []
    if (!ctx.methods) ctx.methods = {}
    if (!ctx.watch) ctx.watch = {}

    // Normalize model.
    const model = ctx.model || {
      prop: 'value',
      event: 'input'
    }

    // Get props.
    const props = Object.keys(ctx.props)

    for (const i in props) {
      const prop = props[i]

      let shouldProcess = true
      let shouldEmit = true
      let event

      if (prop === model.prop) {
        event = model.event
      } else if (ctx.props[prop].sync) {
        event = `update:${prop}`
      } else if (ctx.props[prop].watch) {
        shouldEmit = false
      } else {
        shouldProcess = false
      }

      if (shouldProcess) {
        const Prop = upperCaseFirst(prop)
        const localProp = `local${Prop}`
        const transformedProp = `transformed${Prop}`
        const transformedLocalProp = `transformedLocal${Prop}`
        const sendProp = `send${Prop}`
        const onReceiveProp = `onReceive${Prop}`
        const onSendProp = `onSend${Prop}`

        ctx.localDataKeys.push(localProp)

        if (shouldEmit) {
          ctx.methods[sendProp] = function (newValue) {
            // Compatible to Event value.
            if (newValue instanceof Event && newValue.target && newValue.target.value) {
              newValue = newValue.target.value
            }

            this[localProp] = newValue
          }
        }

        ctx.watch[prop] = {
          // Immediately receive prop value.
          immediate: true,

          handler(newValue, oldValue) {
            if (
              // If the newValue is equal to the oldValue, ignore it.
              newValue === oldValue ||
              // If the prop-watcher was triggered by the mutation of the localProp, ignore it.
              newValue === this[transformedLocalProp]
            ) {
              this[transformedProp] = newValue
              return
            }

            if (isFunction(this[onReceiveProp])) {
              this[onReceiveProp](
                newValue,
                transformedNewValue => {
                  newValue = transformedNewValue
                },
                oldValue,
                transformedOldValue => {
                  oldValue = transformedOldValue
                }
              )

              if (newValue === oldValue || newValue === this[transformedLocalProp]) return
            }

            this[transformedProp] = newValue

            this[localProp] = newValue
          }
        }

        ctx.watch[localProp] = {
          immediate: false,
          handler(newValue, oldValue) {
            if (newValue === oldValue || newValue === this[transformedProp]) return

            if (isFunction(this[onSendProp])) {
              this[onSendProp](
                newValue,
                transformedNewValue => {
                  newValue = transformedNewValue
                },
                oldValue,
                transformedOldValue => {
                  oldValue = transformedOldValue
                }
              )

              if (newValue === oldValue || newValue === this[transformedProp]) return
            }

            this[transformedLocalProp] = newValue

            if (shouldEmit) {
              this.$emit(event, newValue, oldValue)
            }
          }
        }
      }
    }
  },

  data() {
    return this.$options.localDataKeys.reduce((data, key) => {
      data[key] = null
      return data
    }, {})
  }
}
