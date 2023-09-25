export * from 'gamba-core'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json')
console.log('🍤 Gamba version %s', packageJson.version)
