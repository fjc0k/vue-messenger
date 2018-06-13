# Vue Messenger

[![Travis](https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master)](https://travis-ci.org/fjc0k/vue-messenger)
[![codecov](https://codecov.io/gh/fjc0k/vue-messenger/branch/master/graph/badge.svg)](https://codecov.io/gh/fjc0k/vue-messenger)
[![minified size](https://img.shields.io/badge/minified%20size-2%20KB-blue.svg?MIN)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)
[![minzipped size](https://img.shields.io/badge/minzipped%20size-966%20B-blue.svg?MZIP)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)

Listen and transform props before receiving & sending them.

# Install

## Package

```bash
# yarn
yarn add vue-messenger

# or, npm
npm i vue-messenger
```

## CDN

- [jsDelivr](//www.jsdelivr.com/package/npm/vue-messenger)
- [UNPKG](//unpkg.com/vue-messenger/)

Available as global `VueMessenger`.

# Example

```html
<template>
  <input
    v-model="localValue"
    v-show="localVisible"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      transform: {
        receive: value => String(value),
        send: Number
      },
      on: {
        receive: console.log,
        send: console.log,
        change: console.log
      }
    },
    visible: {
      type: Boolean,
      sync: true
    }
  }
}
</script>
```
