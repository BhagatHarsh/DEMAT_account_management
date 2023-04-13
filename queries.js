// Import required modules
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const dematgen = require('./utils/dematgen')

const getUserByDematId = async (demat_id) => {
  try {
    // Get the user's data from the users and demat tables using a join query
    const queryText = 'SELECT u.pan_number, u.first_name, u.last_name, u.pincode, d.demat_id FROM users u JOIN demat d ON u.pan_number = d.pan_number WHERE d.demat_id = $1';
    const result = await pool.query(queryText, [demat_id]);

    // If no user data is found, throw an error
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Return the user data
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};


const getTraderByPanNumber = async (pan_number) => {
  try {
    // Query to retrieve user data from the users table
    const userQuery = 'SELECT * FROM users WHERE pan_number = $1';
    const userValues = [pan_number];
    const userResult = await pool.query(userQuery, userValues);

    // Query to retrieve demat data from the demat table
    const dematQuery = 'SELECT * FROM demat WHERE pan_number = $1';
    const dematValues = [pan_number];
    const dematResult = await pool.query(dematQuery, dematValues);

    // Combine the user and demat data
    const data = {
      first_name: userResult.rows[0].first_name,
      last_name: userResult.rows[0].last_name,
      pan_number: userResult.rows[0].pan_number,
      pincode: userResult.rows[0].pincode,
      demat_id: dematResult.rows[0].demat_id
    };

    return data;
  } catch (err) {
    throw err;
  }
};


const registerTrader = async (data) => {
  try {
    // Hash the user's password before storing it in the database
    const hashedpassword = await bcrypt.hash(data.password, 10);

    // Insert the user's registration data into the users table
    const insertUserQuery = 'INSERT INTO users (pan_number, first_name, last_name, ifsc_code, pincode, password) VALUES ($1, $2, $3, $4, $5, $6)';
    const insertUserValues = [data.pan_number, data.first_name, data.last_name, data.ifsc_code, data.pincode, hashedpassword];
    await pool.query(insertUserQuery, insertUserValues);

    // Insert phone number data into the phone_number table
    const insertPhoneQuery = 'INSERT INTO phone_number (pan_number, phone_number) VALUES ($1, $2)';
    const insertPhoneValues = [data.pan_number, data.phone_number];
    await pool.query(insertPhoneQuery, insertPhoneValues);

    // Insert bank data into the Banks table
    const insertBankQuery = 'INSERT INTO Banks (bank_name, ifsc_code) VALUES ($1, $2)';
    const insertBankValues = [data.bank_name, data.ifsc_code];
    await pool.query(insertBankQuery, insertBankValues);

    // Insert demat data into the Demat table
    const dematID = dematgen.generateDematID();
    const insertDematQuery = 'INSERT INTO Demat (demat_id, pan_number) VALUES ($1, $2)';
    const insertDematValues = [dematID, data.pan_number];
    await pool.query(insertDematQuery, insertDematValues);

    // Insert demat details into the Demat_details table
    const insertDematDetailsQuery = 'INSERT INTO Demat_details (demat_id, account_number, ifsc_code) VALUES ($1, $2, $3)';
    const insertDematDetailsValues = [dematID, data.account_number, data.ifsc_code];
    await pool.query(insertDematDetailsQuery, insertDematDetailsValues);

    // Return the Demat ID to be displayed to the user
    data.demat_id = dematID
    return data;
  } catch (err) {
    throw err;
  }
};

const registerCompany = async (data) => {
  try {
    // Hash the company's password before storing it in the database
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert company data into the Companies table
    const insertCompanyQuery = 'INSERT INTO Companies (Symbol, Company_name) VALUES ($1, $2)';
    const insertCompanyValues = [data.company_symbol, data.company_name];
    await pool.query(insertCompanyQuery, insertCompanyValues);

    // Insert company info data into the Company_info table
    const insertCompanyInfoQuery = 'INSERT INTO Company_info (GST_Number, password, Symbol) VALUES ($1, $2, $3)';
    const insertCompanyInfoValues = [data.gst_number, hashedPassword, data.company_symbol];
    await pool.query(insertCompanyInfoQuery, insertCompanyInfoValues);

    // Return the company symbol to be displayed to the user
    return data.company_symbol;
  } catch (err) {
    throw err;
  }
};

const getCompanyByGstNumber = async (gstNumber) => {
  try {
    const queryText = 'SELECT * FROM company_info WHERE gst_number = $1';
    const queryValues = [gstNumber];
    const { rows } = await pool.query(queryText, queryValues);
    return rows[0];
  } catch (err) {
    throw err;
  }
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
      'company_info',
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
  registerTrader,
  resetDatabase,
  registerCompany,
  getTraderByPanNumber,
  getUserByDematId,
  getCompanyByGstNumber
};
