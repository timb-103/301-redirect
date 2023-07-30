module.exports = {
  apps: [
    {
      name: '301redirect',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
    },
  ],
}
