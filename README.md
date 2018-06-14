<p align="center"><img width="100" src="./images/logo.png" alt="Vue Messenger logo"></p>

<p align="center">
  <a href="https://travis-ci.org/fjc0k/vue-messenger"><img src="https://travis-ci.org/fjc0k/vue-messenger.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/fjc0k/vue-messenger"><img src="https://codecov.io/gh/fjc0k/vue-messenger/branch/master/graph/badge.svg" alt="Coverage Status"></a>
  <a href="https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js"><img src="https://img.shields.io/badge/minzipped%20size-2.1%20KB-blue.svg?MIN" alt="Minified Size"></a>
  <a href="https://github.com/fjc0k/vue-messenger/blob/master/dist/vue-messenger.min.js"><img src="https://img.shields.io/badge/minified%20size-1023%20B-blue.svg?MZIP" alt="Minzipped Size"></a>
  <a href="https://www.npmjs.com/package/vue-messenger"><img src="https://img.shields.io/npm/v/vue-messenger.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/vue-messenger"><img src="https://img.shields.io/npm/l/vue-messenger.svg" alt="License"></a>
</p>

# Vue Messenger

A series of useful enhancements to Vue component props:

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

### Transform props

#### Example

- before

    ```html
    <template>
      <div>{{ normalizedCount }}</div>
    </template>
    
    <script>
    export default {
      props: {
        count: [Number, String]
      },
      computed: {
        normalizedCount() {
          return Number(this.count)
        }
      }
    }
    </script>
    ```

- after

    ```html
    <template>
      <div>{{ localCount }}</div>
    </template>
    
    <script>
    export default {
      mixins: [VueMessenger],
      props: {
        count: {
          type: [Number, String],
          transform: Number
        }
      }
    }
    </script>
    ```

### Enum-type props

#### Example

- before

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

- after

    ```js
    export default {
      mixins: [VueMessenger],
      props: {
        size: {
          type: String,
          enum: ['small', 'large']
        }
      }
    }
    ```

### Numeric-type props

#### Example

- before

    ```js
    export default {
      props: {
        count: {
          type: [Number, String],
          default: 0,
          validator: value => !isNaN(value - parseFloat(value))
          }
        }
      }
    }
    ```

- after

    ```js
    export default {
      mixins: [VueMessenger],
      props: {
        count: {
          numeric: true,
          default: 0
        }
      }
    }
    ```

### Listen for receiving props

#### Example

- before

    ```js
    export default {
      props: {
        count: [Number, String]
      },
      watch: {
        count(newCount, oldCount) {
          console.log(newCount, oldCount)
        }
      }
    }
    ```

- after

    ```js
    export default {
      mixins: [VueMessenger],
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

#### Example

- before

    ```html
    <template>
      <input v-model="curValue" />
    </template>

    <script>
    export default {
      props: {
        value: String
      },
      computed: {
        curValue: {
          get() {
            return this.value
          },
          set(newValue) {
            this.$emit('input', newValue)
          }
        }
      }
    }
    </script>
    ```
  
- after

    ```html
    <template>
      <input v-model="localValue" />
    </template>

    <script>
    export default {
      mixins: [VueMessenger],
      props: {
        value: String
      }
    }
    </script>
    ```
