import * as buffer from 'buffer'

declare const window: Window & typeof globalThis & { Buffer: any }
window.Buffer = buffer.Buffer

console.debug('🍤 Gamba polyfill')
