// Import required modules
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');

// Function to retrieve all users from the database
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

// Function to register a new user in the database
const registerUser = (data) => {
  return new Promise((resolve, reject) => {
    // Hash the user's password before storing it in the database
    bcrypt.hash(data.password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        // SQL query with parameterized placeholders
        const query = 'INSERT INTO users (pan_number, pincode, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5)';
        // Array of parameter values to be passed to the query
        const values = [data.pan_number, data.pincode, hash, data.first_name, data.last_name];

        // Execute the query with the parameter values
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

// Function to log in a user
const loginUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE pan_number = $1', [data.pan_number]);

      if (result.rows.length === 0) {
        reject('User not found');
      } else {
        bcrypt.compare(data.password, result.rows[0].password, (err, isMatch) => {
          if (err) {
            reject(err);
          } else if (!isMatch) {
            reject('Incorrect password');
          } else {
            // Return the user's ID along with the success message
            resolve({ message: 'Login successful', userId: result.rows[0].id });
          }
        });
      }
    } catch (err) {
      console.error(err);
      reject('Error retrieving user from database');
    }
  });
};

const getUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE pan_number = $1', [userId]);

      if (result.rows.length === 0) {
        reject('User not found');
      } else {
        resolve(result.rows[0]);
      }
    } catch (err) {
      console.error(err);
      reject('Error retrieving user from database');
    }
  });
};


// Export the functions for use in other modules
module.exports = {
  getUsers,
  registerUser,
  loginUser,
  getUserById
};
