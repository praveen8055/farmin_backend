module.exports = {
  apps: [
    {
      name: 'farmin-backend',
      script: 'npm',
      args: 'run server',
      interpreter: 'none', // tells PM2 to run npm directly
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};

