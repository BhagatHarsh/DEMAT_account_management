// Import required modules
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const dematgen = require('./utils/dematgen')

// Function to retrieve all users from the database
const getAllUserData = () => {
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

const getAllBanksData = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM banks';
    pool.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};


const getAllDematData = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM demat';

    pool.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

const getUserData = (pan_number) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE pan_number = $1';
    pool.query(query, [pan_number], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};

const getDematData = (pan_number) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT demat_id FROM demat WHERE pan_number = $1';
    pool.query(query, [pan_number], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};

const getAllPhoneNumberData = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM phone_number';

    pool.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

const getAllBankDetailsData = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM demat_details';

    pool.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

const getBankDetailsByIFSC = (ifsc_code) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM banks WHERE ifsc_code = $1';
    pool.query(query, [ifsc_code], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};


const registerUser = async (data) => {
  try {
    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert the user's registration data into the users table
    const insertUserQuery = 'INSERT INTO users (pan_number, pincode, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5)';
    const insertUserValues = [data.pan_number, data.pincode, hashedPassword, data.first_name, data.last_name];
    await pool.query(insertUserQuery, insertUserValues);

    // Insert phone number data into the phone_number table
    const insertPhoneQuery = 'INSERT INTO phone_number (pan_number, phone_number) VALUES ($1, $2)';
    const insertPhoneValues = [data.pan_number, data.phone_number];
    await pool.query(insertPhoneQuery, insertPhoneValues);

    // Insert bank data into the banks table
    const insertBankQuery = 'INSERT INTO banks (bank_name, ifsc_code) VALUES ($1, $2)';
    const insertBankValues = [data.bank_name, data.ifsc_code];
    await pool.query(insertBankQuery, insertBankValues);

    // Insert demat data into the demat table
    const dematID = dematgen.generateDematID();
    const insertDematQuery = 'INSERT INTO demat (demat_id, pan_number) VALUES ($1, $2)';
    const insertDematValues = [dematID, data.pan_number];
    await pool.query(insertDematQuery, insertDematValues);

    // Insert demat details into the demat_details table
    const insertDematDetailsQuery = 'INSERT INTO demat_details (demat_id, account_number, ifsc_code) VALUES ($1, $2, $3)';
    const insertDematDetailsValues = [dematID, data.account_number, data.ifsc_code];
    await pool.query(insertDematDetailsQuery, insertDematDetailsValues);

    // Return the Demat ID to be displayed to the user
    return dematID;
  } catch (err) {
    throw err;
  }
};


// Function to get user by demat_id
const getUserByDematId = (demat_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE PAN_Number IN (SELECT PAN_Number FROM demat WHERE Demat_ID = $1)', [demat_id]);

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

const resetDatabase = async () => {
  try {
    const tables = [
      'users_broker',
      'share_purchased',
      'phone_number',
      'mutual_fund_invest',
      'mf_purchased',
      'listing',
      'exchanges',
      'demat_details',
      'demat_broker',
      'demat',
      'companies',
      'broker_phoneno',
      'broker_exchange',
      'broker',
      'banks',
      'users'
    ];

    for (let i = 0; i < tables.length; i++) {
      const query = `DELETE FROM ${tables[i]}`;
      await pool.query(query);
    }

    console.log('All data has been deleted from the database');
  } catch (err) {
    console.error(err);
    throw err;
  }
};




// Export the functions for use in other modules
module.exports = {
  getAllUserData,
  getAllDematData,
  registerUser,
  getUserById,
  getUserData, 
  getDematData,
  getAllBankDetailsData,
  getAllPhoneNumberData,
  resetDatabase,
  getBankDetailsByIFSC,
  getAllBanksData,
  getUserByDematId
};
