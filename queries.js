const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');


const getUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      resolve(result.rows);
    } catch (err) {
      console.error(err);
      reject('Error retrieving users from database');
    }
  });
};

/*
INSERT INTO users (pan_number, pincode, password, first_name, last_name) VALUES ('123456789', 382418, '123', 'Harsh', 'Bhagat')
*/


const registerUser = (data) => {
  return new Promise((resolve, reject) => {
    // hash the password
    bcrypt.hash(data.password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        // SQL query with parameterized placeholders
        const query = 'INSERT INTO users (pan_number, pincode, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5)';

        // array of parameter values to be passed to the query
        const values = [data.pan_number, data.pincode, hash, data.first_name, data.last_name];

        // execute the query with the parameter values
        pool.query(query, values, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve('Data inserted successfully');
          }
        });
      }
    });
  });
};


module.exports = {
      getUsers,
      registerUser
    }