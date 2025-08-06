const nextraPkg = require('nextra');
const withNextra = (nextraPkg.default || nextraPkg)({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
});


module.exports = withNextra();
