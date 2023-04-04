const { pool } = require("./dbConfig");


const getUsers = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}
  module.exports = {
    getUsers,
}