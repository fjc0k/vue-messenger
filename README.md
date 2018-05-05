# 📫 Vue Messenger [![Travis](https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master)](https://travis-ci.org/fjc0k/vue-messenger)

[![minified size](https://img.shields.io/badge/minified%20size-1.41%20KB-blue.svg?MIN&style=for-the-badge)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)
[![minzipped size](https://img.shields.io/badge/minzipped%20size-742%20B-blue.svg?MZIP&style=for-the-badge)](https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js)

Light two-way data binding, with optional listeners and transformations.

# Install

```bash
yarn add vue-messenger
```

CDN: [jsDelivr](//www.jsdelivr.com/package/npm/vue-messenger) | [UNPKG](//unpkg.com/vue-messenger/) (Avaliable as `window.VueMessenger`)

# Example

[Run this example on JSFiddle 🚀](https://jsfiddle.net/ifunch/1w7855cd/)

```html
<template>
  <input v-model="localValue" />
</template>

<script>
  import VueMessenger from 'vue-messenger'

  export default {
    name: 'my-input',

    mixins: [
      VueMessenger
    ],

    props: {
      value: String
    },

    methods: {
      onReceiveValue(value, transformTo) {
        transformTo(
          String(value).split(',').join('/')
        )
      },
      onSendValue(value, transformTo) {
        transformTo(
          String(value).replace(/\//g, ',')
        )
      }
    }
  }
</script>
```

# API

## props

### sync

Type: `boolean`

Default: `false`

You can set `{ sync: true }` to enable two-way data binding by the `.sync` modifier, for example:

```html
<!-- my-dialog.vue -->
<template>
  <div @click="sendVisible(!localVisible)">
    <!-- ... -->
  </div>
</template>

<script>
  export default {
    /* ... */
    props: {
      visible: {
        type: Boolean,
        sync: true
      }
    }
  }
</script>
```

```html
<!-- app.vue -->
<template>
  <my-dialog visible.sync="visible" />
</template>

<script>
  export default {
    /* ... */
    data: () => ({
      visible: true
    })
  }
</script>
```

## data

### localProp

