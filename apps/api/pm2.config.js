module.exports = {
  apps: [{
    name: 'api',
    script: 'dist/index.js',
    node_args: '-r dotenv/config',
  },
  ],
}
