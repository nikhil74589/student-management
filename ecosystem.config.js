module.exports = {
  apps: [
    {
      name: "student-dev",
      script: "./server.js",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
        ENV_FILE: "env/dev.env"
      }
    },
    {
      name: "student-qa",
      script: "./server.js",
      env: {
        NODE_ENV: "qa",
        PORT: 3002,
        ENV_FILE: "env/qa.env"
      }
    },
    {
      name: "student-prod",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        ENV_FILE: "env/prod.env"
      }
    }
  ]
};
