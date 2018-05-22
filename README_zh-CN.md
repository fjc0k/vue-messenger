🇨🇳中文 | [English](./README.md)

# Vue Messenger

[![Travis](https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master)](https://travis-ci.org/fjc0k/vue-messenger)
[![codecov](https://codecov.io/gh/fjc0k/vue-messenger/branch/master/graph/badge.svg)](https://codecov.io/gh/fjc0k/vue-messenger)
[![minified size](https://img.shields.io/badge/minified%20size-1.46%20KB-blue.svg?MIN)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)
[![minzipped size](https://img.shields.io/badge/minzipped%20size-772%20B-blue.svg?MZIP)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)

一款轻量的父子组件通信插件。

# 特性

- 基于 Vue 的 `v-model` 和 `.sync`，无侵入性。
- 支持数据双向绑定。
- 支持监听数据变化。
- 支持数据转换。

# 安装

```bash
# Yarn
yarn add vue-messenger

# NPM
npm i vue-messenger
```

CDN：[jsDelivr](//www.jsdelivr.com/package/npm/vue-messenger) | [UNPKG](//unpkg.com/vue-messenger/) （可通过 `window.VueMessenger` 使用）

# 混入

## 组件级别混入

你应该只在真正需要的组件内混入 `VueMessenger`，以减少不必要的性能消耗。

```js
import VueMessenger from 'vue-messenger'

export default {
  mixins: [
    VueMessenger
  ],

  // ...
}
```

## 全局混入

你也可以全局混入 `VueMessenger`，它将对所有组件生效。

```js
import Vue from 'vue'
import VueMessenger from 'vue-messenger'

Vue.mixin(VueMessenger)

// ...
```


# 使用

## 应该中转哪些数据？

在使用之前，`VueMessenger` 需要知道应该中转哪些数据。

`VueMessenger` 默认会中转 `v-model` 对应的 `prop`，一般情况下，这个 `prop` 是 `value`，你可以通过设置组件的 [`model`](https://cn.vuejs.org/v2/api/#model) 选项改变这个 `prop`。

如果需要中转其他数据，你需要在组件的 `props` 选项中设置 `prop` 的 `sync` 为 `true`。

一个例子：

```js
// picker.vue
{
  props: {
    value: Array, // 默认中转
    data: Array, // 未设置 sync，不中转
    visible: { // sync 为 true，中转
      type: Boolean,
      sync: true
    },
    detail: { // sync 为 true，中转
      type: Array,
      sync: true
    },
    cascade: { // sync 为 false，不中转
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

## 怎样访问数据？

经 `VueMessenger` 中转的数据会被局部化，因此，在组件内部，你应该通过 `localProp` 访问它们，以避免直接操作父组件的数据。比如：

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

## 怎样发送数据？

组件内的 `localProp` 值发生了改变，我们要将其新值同步至父组件，有两种方法：

- 使用 `sendProp` 方法：

```js
// picker.vue
{
  methods: {
    // 选择条目时同步新数据
    handleItemSelect(value) {
      this.sendValue(value)
    },

    // 点击取消按钮时关闭 Picker 组件
    handleCancelClick() {
      this.sendVisible(false)
    }
  }
}
```

- 直接给 `localProp` 赋值：

```js
// picker.vue
{
  methods: {
    // 选择条目时同步新数据
    handleItemSelect(value) {
      this.localValue = value
    },

    // 点击取消按钮时关闭 Picker 组件
    handleCancelClick() {
      this.localVisible = false
    }
  }
}
```

> 其实 `sendProp` 内部就是直接给 `localProp` 赋值。


## 怎样监听和转换数据？

我们可以通过 `onReceiveProp` 和 `onSendProp` 监听数据的接收和发送，同时还可对数据进行一些转换。如：

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
