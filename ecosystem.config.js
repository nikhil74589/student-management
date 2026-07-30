module.exports = {
  apps: [
    {
      name: 'student-dev',
      script: 'server.js',
      env: {
        NODE_ENV: 'dev',
        PORT: 3001,
        ENV_FILE: 'env/.env.dev'
      }
    },
    {
      name: 'student-qa',
      script: 'server.js',
      env: {
        NODE_ENV: 'qa',
        PORT: 3002,
        ENV_FILE: 'env/.env.qa'
      }
    },
    {
      name: 'student-prod',
      script: 'server.js',
      env: {
        NODE_ENV: 'prod',
        PORT: 3000,
        ENV_FILE: 'env/.env.prod'
      }
    }
  ]
};module.exports = {
  apps: [
    {
      name: "student-dev",
      script: "./server.js",
      env: {
        ENV_FILE: "env/dev.env"
      }
    },
    {
      name: "student-qa",
      script: "./server.js",
      env: {
        ENV_FILE: "env/qa.env"
      }
    },
    {
      name: "student-prod",
      script: "./server.js",
      env: {
        ENV_FILE: "env/prod.env"
      }
    }
  ]
};
