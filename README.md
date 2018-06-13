English | [🇨🇳中文](./README_zh-CN.md)

# Vue Messenger

[![Travis](https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master)](https://travis-ci.org/fjc0k/vue-messenger)
[![codecov](https://codecov.io/gh/fjc0k/vue-messenger/branch/master/graph/badge.svg)](https://codecov.io/gh/fjc0k/vue-messenger)
[![minified size](https://img.shields.io/badge/minified%20size-1.76%20KB-blue.svg?MIN)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)
[![minzipped size](https://img.shields.io/badge/minzipped%20size-875%20B-blue.svg?MZIP)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)

A lightweight Vue mixin for communicating between Parent and Child components.

# Features

- Based on `v-model` and `.sync` of Vue, non-invasively.
- Support two-way data binding.
- Support listening to data changes. 
- Support data transformations.

# Install

```bash
# Yarn
yarn add vue-messenger

# NPM
npm i vue-messenger
```

CDN: [jsDelivr](//www.jsdelivr.com/package/npm/vue-messenger) | [UNPKG](//unpkg.com/vue-messenger/) (Available as `window.VueMessenger`)

# Mixin

## Component-level Mixin

You should apply the `VueMessenger` mixin to the components that actually need it, which will reduce unnecessary performance costs.

```js
import VueMessenger from 'vue-messenger'

export default {
  mixins: [
    VueMessenger
  ],

  // ...
}
```

## Global Mixin

You can also apply the `VueMessenger` mixin globally to all components.

```js
import Vue from 'vue'
import VueMessenger from 'vue-messenger'

Vue.mixin(VueMessenger)

// ...
```


# Usage

## What data should be transferred ?

Before using, `VueMessenger` needs to know what data should be transferred.

By default, `VueMessenger` will transfer the `prop` that used with `v-model`. In general, the `prop` is `value`. You can use the [`model`](https://vuejs.org/v2/api/#model) option of components to change the `prop`.

If you need to transfer other data, you can set `prop.sync` to `true` in the `props` option of components.

As an example:

```js
// picker.vue
{
  props: {
    value: Array, // transfer by default
    data: Array, // sync is not set, don't transfer
    visible: { // sync is true, transfer it
      type: Boolean,
      sync: true
    },
    detail: { // sync is true, transfer it
      type: Array,
      sync: true
    },
    cascade: { // sync is false, don't transfer
      type: Boolean,
      sync: false
    }
  }
}
```

```html
<!-- app.vue -->
<template>
  <picker
    v-model="selectedValue"
    :data="pickerData"
    :detail.sync="selectedDetail"
    :visible.sync="visible"
  />
</template>
```

## How to access data ?

The transferred data will be localized, so you should access them by using `localProp` inside the components, to avoid directly manipulating the parent's data. e.g.

```html
<!-- picker.vue -->
<template>
  <div v-show="localVisible">
    <div
      v-for="(groupData, groupIndex) in data"
      :key="groupIndex">
      <div
        v-for="(item, itemIndex) in groupData"
        :class="{ selected: localValue[groupIndex] === item.value }"
        :key="itemIndex">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
```

## How to send data ?

If the `localProp` values have changed, here are two ways to send new values to parent components:

- Call `sendProp` with new value:

```js
// picker.vue
{
  methods: {
    handleItemSelect(value) {
      this.sendValue(value)
    },
    handleCancelClick() {
      this.sendVisible(false)
    }
  }
}
```

- Assign `localProp` new value:

```js
// picker.vue
{
  methods: {
    handleItemSelect(value) {
      this.localValue = value
    },
    handleCancelClick() {
      this.localVisible = false
    }
  }
}
```

> Actually, `sendProp` is a funtional wrapper of assigning `localProp` new value.


## How to listen and transform data ?

You can use `onReceiveProp` and `onSendProp` to listen to the receiving and sending of data, in the meantime you can make some transformations to data. e.g.

```js
// picker.vue
{
  methods: {
    onReceiveValue(value) {
      console.log('new value: ' + value)
    },
    onSendValue(value, transformTo) {
      transformTo(
        value.map(_ => Number(_))
      )
    },
    onReceiveVisible(visible, transformTo, oldVisible, oldVisibleTransformTo) {
      console.log(`${oldVisible} ==> ${visible}`)
      oldVisibleTransformTo(
        Boolean(oldVisible)
      )
      transformTo(
        Boolean(visible)
      )
    }
  }
}
```
