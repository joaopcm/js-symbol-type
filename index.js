const assert = require('node:assert')

// -- unique keys
const uniqueKey = Symbol('userName')
const user = {}

user['userName'] = 'value for normal Objects'
user[uniqueKey] = 'value for unique keys'

// console.log('getting normal Objects', user.userName)
// // always unique in memory address level
// console.log('getting normal Objects', user[uniqueKey])
// console.log('getting normal Objects', user[Symbol('userName')])

assert.deepStrictEqual(user.userName, 'value for normal Objects')
assert.deepStrictEqual(user[uniqueKey], 'value for unique keys')
assert.deepStrictEqual(user[Symbol('userName')], undefined)

assert.deepStrictEqual(Object.getOwnPropertySymbols(user)[0], uniqueKey)

// bypassing the unique key - not recommended
user[Symbol.for('password')] = 123
assert.deepStrictEqual(user[Symbol.for('password')], 123)
// -- unique keys

// -- well known symbols
const obj = {
  [Symbol.iterator]: () => ({
    items: ['c', 'b', 'a'],
    next() {
      return {
        done: this.items.length === 0,
        value: this.items.pop()
      }
    }
  })
}

// for (const iterator of obj) {
//   console.log('iterator', iterator)
// }

assert.deepStrictEqual([...obj], ['a', 'b', 'c'])

const kItems = Symbol('kItems')
class MyDate {
  constructor(...args) {
    this[kItems] = args.map(arg => new Date(...arg))
  }

  [Symbol.toPrimitive](coercionType) {
    if (coercionType !== 'string') throw new TypeError()

    const itens = this[kItems].map(item => new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    }).format(item))

    return new Intl.ListFormat('pt-BR', {
      style: 'long',
      type: 'conjunction'
    }).format(itens)
  }

  get [Symbol.toStringTag]() {
    return 'What?'
  }

  *[Symbol.iterator]() {
    for (const item of this[kItems]) {
      yield item
    }
  }

  async *[Symbol.asyncIterator]() {
    const timeout = ms => new Promise(r => setTimeout(r, ms))
    for (const item of this[kItems]) {
      await timeout(100)
      yield item.toISOString()
    }
  }
}

const myDate = new MyDate(
  [2020, 03, 01],
  [2018, 02, 02],
)

const expectedDates = [
  new Date(2020, 03, 01),
  new Date(2018, 02, 02),
]

assert.deepStrictEqual(Object.prototype.toString.call(myDate), '[object What?]')
assert.throws(() => myDate + 1, TypeError)
assert.deepStrictEqual(String(myDate), '01 de abril de 2020 e 02 de março de 2018')
assert.deepStrictEqual([...myDate], expectedDates)

// ;(async () => {
//     for await (const item of myDate) {
//       console.log('async iterator', item)
//     }
// })()

;(async () => {
  const dates = await Promise.all([...myDate])
  assert.deepStrictEqual(dates, expectedDates)
})()