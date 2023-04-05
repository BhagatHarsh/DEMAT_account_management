const { pool } = require("./dbConfig");


const getUsers = async () => {
  try {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving users from database');
  }
}
module.exports = {
  getUsers,
}