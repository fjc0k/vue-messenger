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
      // Get prop & event.
      const prop = props[i]
      const event = prop === model.prop ?
        model.event :
        ctx.props[prop].sync ?
          `update:${prop}` :
          null

      if (event) {
        const Prop = upperCaseFirst(prop)
        const localProp = `local${Prop}`
        const transformedProp = `transformed${Prop}`
        const transformedLocalProp = `transformedLocal${Prop}`
        const sendProp = `send${Prop}`
        const onReceiveProp = `onReceive${Prop}`
        const onSendProp = `onSend${Prop}`

        ctx.localDataKeys.push(localProp)

        ctx.methods[sendProp] = function (newValue) {
          // Compatible to Event value.
          if (newValue instanceof Event && newValue.target && newValue.target.value) {
            newValue = newValue.target.value
          }

          this[localProp] = newValue
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
            ) return

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

            this.$emit(event, newValue, oldValue)
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
