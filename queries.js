// Import required modules
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const dematgen = require('./utils/dematgen')

const getUserByDematId = async (demat_id) => {
  try {
    const queryText = `
      SELECT *
      FROM users u
      JOIN demat d ON u.pan_number = d.pan_number
      JOIN demat_details dd ON d.demat_id = dd.demat_id
      JOIN demat_broker db ON d.demat_id = db.demat_id
      JOIN broker b ON db.broker_name = b.broker_name
      WHERE d.demat_id = $1
    `;
    const result = await pool.query(queryText, [demat_id]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Return the user data and broker details
    const data = result.rows[0];
    const balance = await pool.query('SELECT balance FROM balance WHERE account_number = $1', [data.account_number]);
    data.balance = balance.rows[0].balance;

    const phone_number = await pool.query('SELECT phone_number FROM broker_phoneno WHERE broker_id = $1', [data.broker_id]);
    data.phone_number = phone_number.rows[0].phone_number;
    return data;
  } catch (err) {
    throw err;
  }
};

const getBrokerDetails = async (broker_id) => {
  try {
    const queryText = `
      SELECT *
      FROM broker b
      JOIN broker_account ba ON b.broker_id = ba.broker_id
      JOIN balance bl ON ba.account_number = bl.account_number
      WHERE b.broker_id = $1
    `;
    const result = await pool.query(queryText, [broker_id]);

    if (result.rows.length === 0) {
      throw new Error('Broker not found');
    }
    

    // Return the broker data and account details
    const data = result.rows[0];
    const phone_number = await pool.query('SELECT phone_number FROM broker_phoneno WHERE broker_id = $1', [broker_id]);
    data.phone_number = phone_number.rows[0].phone_number;
    return data;
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

const getBrokerNames = async () => {
  try {
    const queryResult = await pool.query('SELECT broker_name FROM broker');
    const brokerNames = queryResult.rows.map(row => row.broker_name);
    return brokerNames;
  } catch (err) {
    throw err;
  }
}

const getExchangeNames = async () => {
  try {
    const queryResult = await pool.query('SELECT exchange_name, city FROM exchanges');
    return queryResult.rows;
  } catch (err) {
    throw err;
  }
}


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
    const insertBankQuery = 'INSERT INTO Banks (bank_name, ifsc_code) VALUES ($1, $2) ON CONFLICT (ifsc_code) DO NOTHING';
    const insertBankValues = [data.bank_name, data.ifsc_code]
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

    const insertIntoBalance = 'INSERT INTO balance (account_number) VALUES ($1)';
    const insertIntoBalanceValues = [data.account_number]
    await pool.query(insertIntoBalance, insertIntoBalanceValues)

    const insertIntoDemat_Broker = 'INSERT INTO Demat_Broker(Broker_name, demat_id) VALUES ($1, $2)';
    const insertIntoDemat_BrokerValues = [data.broker, dematID];
    await pool.query(insertIntoDemat_Broker, insertIntoDemat_BrokerValues)
    // Return the Demat ID to be displayed to the user
    data.demat_id = dematID;
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
    return data;
  } catch (err) {
    throw err;
  }
};


const registerBroker = async (data) => {
  try {
    // Hash the company's password before storing it in the database
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert company data into the Companies table
    const brokerID = dematgen.generateDematID();
    const insertBrokerQuery = 'INSERT INTO Broker (Broker_name, Password, Broker_ID) VALUES ($1, $2, $3)';
    const insertBrokerValues = [data.broker_name, hashedPassword, brokerID];
    await pool.query(insertBrokerQuery, insertBrokerValues);

    // Insert broker info data into the Broker_Phoneno table
    const insertBrokerPhoneQuery = 'INSERT INTO Broker_Phoneno (Broker_ID, Phone_Number) VALUES ($1, $2)';
    const insertBrokerPhoneValues = [brokerID, data.phone_number]
    await pool.query(insertBrokerPhoneQuery, insertBrokerPhoneValues);

    // Insert exchanges data for the broker into the Broker_Exchange table
    for (let i = 0; i < data.exchanges.length; i++) {
      const insertBrokerExchangeQuery = 'INSERT INTO Broker_Exchange (Broker_ID, Exchange_name) VALUES ($1, $2)';
      const insertBrokerExchangeValues = [brokerID, data.exchanges[i]]
      await pool.query(insertBrokerExchangeQuery, insertBrokerExchangeValues);
    }

    const InsrtIntoBroker_Account = 'Insert into broker_account(broker_id,account_number) VALUES ($1,$2)';
    const InsrtIntoBroker_AccountValues= [brokerID, data.account_number] 
    await pool.query(InsrtIntoBroker_Account, InsrtIntoBroker_AccountValues);
    // Insert broker account balance into the balance table

    const insertIntoBalance = 'INSERT INTO balance (account_number) VALUES ($1)';
    const insertIntoBalanceValues = [data.account_number]
    await pool.query(insertIntoBalance, insertIntoBalanceValues)

    // Return the broker data to be displayed to the user
    data.broker_id = brokerID;
    return data;
  } catch (err) {
    throw err;
  }
};


// const userBuyRequest = async (data) => {
//   try{



//   }



// };

const getCompanyByGstNumber = async (gstNumber) => {
  try {
    const queryText = `
      SELECT ci.gst_number, c.symbol, c.company_name, c.price, ci.password
      FROM company_info ci
      JOIN companies c ON ci.symbol = c.symbol
      WHERE ci.gst_number = $1
    `;
    const queryValues = [gstNumber];
    const { rows } = await pool.query(queryText, queryValues);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

const getBrokerById = async (brokerId) => {
  try {
    const queryResult = await pool.query('SELECT * FROM broker WHERE broker_id = $1', [brokerId]);
    return queryResult.rows[0];
  } catch (err) {
    throw err;
  }}

const buyShares = async (data) => {
  try {

  } catch (err) {
    throw err;
  }
};



const getbalance = async (data) => {
  try{
    const balance = await pool.query('select balance from balance where account_number = $1', [data.account_number]);
    return balance.rows[0].balance;
  }
  catch (err) {
    throw err;
  }
};

const getCompaniesData = async () => {
  try {
    const query = 'SELECT * FROM companies';
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};


const resetDatabase = async () => {
  try {
    const tables = [
      'phone_number',
      'mutual_fund_invest',
      'mf_purchased',
      'share_purchased',
      'broker_exchange',
      'broker_check',
      'listing',
      // 'company_info',
      // 'companies',
      'demat_broker',
      'demat_details',
      'broker_phoneno',
      'broker_account',
      'banks',
      'balance',
      'broker',
      'demat',
      'users',
      'exchanges'
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
  buyShares,
  getBrokerDetails,
  getCompaniesData,
  registerTrader,
  registerBroker,
  resetDatabase,
  registerCompany,
  getTraderByPanNumber,
  getUserByDematId,
  getCompanyByGstNumber,
  getbalance,
  getBrokerNames,
  getExchangeNames,
  getBrokerById,
};
