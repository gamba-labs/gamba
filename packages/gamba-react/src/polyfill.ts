import * as buffer from 'buffer'
import assert from 'assert'

declare const window: Window & typeof globalThis & { Buffer: any, assert: any }
window.Buffer = buffer.Buffer
window.assert = assert

console.debug('[gamba] polyfill', window.assert)
