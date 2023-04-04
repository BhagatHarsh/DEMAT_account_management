//Copilot write the initial code for pool
const { Pool } = require("pg");

const pool = new Pool({
  user: "bhaguu",
  host: "localhost",
  database: "stock",
  password: "123",
  port: 5432,
});

module.exports = {
  pool
};