<p align="center"><img width="100" src="./images/logo.png" alt="Vue Messenger logo"></p>

<p align="center">
  <a href="https://travis-ci.org/fjc0k/vue-messenger"><img src="https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/fjc0k/vue-messenger"><img src="https://codecov.io/gh/fjc0k/vue-messenger/branch/master/graph/badge.svg" alt="Coverage Status"></a>
  <a href="https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js"><img src="https://img.shields.io/badge/minzipped%20size-2.36%20KB-blue.svg?MIN" alt="Minified Size"></a>
  <a href="https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js"><img src="https://img.shields.io/badge/minified%20size-1.11%20KB-blue.svg?MZIP" alt="Minzipped Size"></a>
  <a href="https://www.npmjs.com/package/vue-messenger"><img src="https://img.shields.io/npm/v/vue-messenger.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/vue-messenger"><img src="https://img.shields.io/npm/l/vue-messenger.svg" alt="License"></a>
</p>

# Vue Messenger

A series of useful enhancements to Vue components props:

- [Transform props](#transform-props)
- [Enum-type props](#enum-type-props)
- [Numeric-type props](#numeric-type-props)
- [Listen for receiving props](#listen-for-receiving-props)
- [Two-way data binding props](#two-way-data-binding-props)

## Install

### Package

```bash
# yarn
yarn add vue-messenger

# or, npm
npm i vue-messenger --save
```

### CDN

- [jsDelivr](//www.jsdelivr.com/package/npm/vue-messenger)
- [UNPKG](//unpkg.com/vue-messenger/dist/)

Available as global `VueMessenger`.

## Usage

### Install mixin

#### Globally

```js
// main.js
import Vue from 'vue'
import Messenger from 'vue-messenger'

Vue.mixin(Messenger)
```

#### Locally

```js
// Component.vue
import Messenger from 'vue-messenger'

export default {
  mixins: [Messenger],
  // ...
}
```

### Transform props

To transform a prop, add a `transform: value => transformedValue` function to its descriptor, and use `this.local${PropName}` to get transformed prop. e.g.

#### 😑 before

```html
<template>
  <div>{{ normalizedMessage }}</div>
</template>

<script>
export default {
  props: {
    message: [Number, String]
  },
  computed: {
    normalizedMessage() {
      return String(this.message).trim().replace(/@/g, '(a)')
    }
  }
}
</script>
```

#### 😀 after

```html
<template>
  <div>{{ localMessage }}</div>
</template>

<script>
export default {
  props: {
    message: {
      type: [Number, String],
      transform: message => String(message).trim().replace(/@/g, '(a)')
    }
  }
}
</script>
```

### Enum-type props

To define a enum-type prop, add a `enum` array to its descriptor, and its `default` value will be `enum[0]` if the descriptor doesn't contain `default` attribute. e.g.

#### 😑 before

```js
export default {
  props: {
    size: {
      type: String,
      default: 'small',
      validator: value => ['small', 'large'].indexOf(value) >= 0
    }
  }
}
```

#### 😀 after

```js
export default {
  props: {
    size: {
      type: String,
      enum: ['small', 'large']
    }
  }
}
```

### Numeric-type props

To define a numeric-type prop, add `numeric: true` to its descriptor. Besides, you can set `infinite` to `ture` to allow infinite numbers, which are `-Infinity` and `Infinity`. e.g.

#### 😑 before

```js
export default {
  props: {
    count: {
      type: [Number, String],
      default: 0,
      validator: value => !isNaN(value - parseFloat(value))
      }
    },
    max: {
      type: [Number, String],
      default: Infinity,
      validator: value => value === Infinity || !isNaN(value - parseFloat(value))
    }
  }
}
```

#### 😀 after

```js
export default {
  props: {
    count: {
      numeric: true,
      default: 0
    },
    max: {
      numeric: true,
      infinite: true,
      default: Infinity
    }
  }
}
```

### Listen for receiving props

To listen for receiving a prop, add `on: { receive: (newValue, oldValue) => void }` object to its descriptor. e.g.

#### 😑 before

```js
export default {
  props: {
    count: [Number, String]
  },
  watch: {
    count: {
      immediate: true,
      handler(newCount, oldCount) {
        console.log(newCount, oldCount)
      }
    }
  }
}
```

#### 😀 after

```js
export default {
  props: {
    count: {
      type: [Number, String],
      on: {
        receive(newCount, oldCount) {
          console.log(newCount, oldCount)
        }
      }
    }
  }
}
```

### Two-way data binding props

To apply two-way data bindings on a prop, add `sync: true` to its descriptor. Then, you can use `this.local${PropName} = newValue` or `this.send${PropName}(newValue)` to send new value to Parent component.

> If the prop is model prop, it's no need to add `sync: true` to its descriptor.

#### 😑 before

```html
<!-- // Parent.vue -->
<template>
  <Child v-model="value" :visible.sync="visible" />
</template>

<script>
import Child from './Child.vue'

export default {
  components: { Child },
  data: () => ({
    value: String,
    visible: Boolean
  })
}
</script>

<!-- // Child.vue -->
<template>
  <div v-show="curVisible">
    <input v-model="curValue" />
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    visible: Boolean
  },
  computed: {
    curValue: {
      get() {
        return this.value
      },
      set(newValue) {
        if (newValue === 'hide') {
          this.curVisible = false
        }
        this.$emit('input', newValue)
      }
    },
    curVisible: {
      get() {
        return this.visible
      },
      set(newVisible) {
        this.$emit('update:visible', newVisible)
      }
    }
  }
}
</script>
```
  
#### 😀 after

```html
<!-- // Parent.vue -->
<template>
  <Child v-model="value" :visible.sync="visible" />
</template>

<script>
import Child from './Child.vue'

export default {
  components: { Child },
  data: () => ({
    value: String,
    visible: Boolean
  })
}
</script>

<!-- // Child.vue -->
<template>
  <div v-show="localVisible">
    <input v-model="localValue" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      on: {
        change(value) {
          if (value === 'hide') {
            this.localVisible = false
          }
        }
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
