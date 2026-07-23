module.exports = {
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
