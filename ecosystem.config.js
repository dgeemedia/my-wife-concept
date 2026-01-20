module.exports = {
  apps: [
    {
      name: 'mypadifood-api',
      script: './src/server.js',
      cwd: './backend',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'mypadifood-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};