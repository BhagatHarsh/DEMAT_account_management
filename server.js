const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const query = require('./queries')
const path = require('path')
const bcrypt = require('bcrypt')
const pool = require('./dbConfig').pool

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);


//get requests
app.get('/login', (req, res) => {
  console.log("get login")
  const role = req.query.role;
  console.log(role)
  res.render(__dirname + `/views/login_${role}`)
});


app.get('/register', async (req, res) => {
  console.log("get register")
  const role = req.query.role;
  console.log(role)
  if (role === "trader") {
    const brokerNames = await query.getBrokerNames();
    res.render(__dirname + `/views/register_trader`, { brokerNames: brokerNames });
  } else if (role === "broker") {
    const exchanges = await query.getExchangeNames();
    res.render(__dirname + `/views/register_broker`, { exchanges: exchanges });
  } else if (role === "company") {
    res.render(__dirname + `/views/register_company`);
  }
})

app.get('/reset', (req, res) => {
  console.log("get reset")
  query.resetDatabase();
  res.redirect('/')
})

app.get('/dashboard', async (req, res) => {
  console.log("get dashboard")
  console.log(req.body)
  console.log(req.query)
  const role = req.query.role;
  const data = JSON.parse(decodeURIComponent(req.query.data));
  console.log(data)
  if (role === "trader") {
    try {
      // Render the dashboard page with the user's information
      res.render(__dirname + '/views/dashboard_user.ejs', { data });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving user information');
    }
  } else if (role === "broker") {
    try {
      // Render the dashboard page with the user's information
      res.render(__dirname + '/views/dashboard_broker.ejs', { data });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving user information');
    }
  } else {
    res.send("Not implemented")
  }
});

//post requests
app.post('/register', async (req, res) => {
  console.log("post register")
  const role = req.body.role;
  console.log(req.body);
  if (role) {
    if (role === "trader") {
      try {
        const data = await query.registerTrader(req.body);
        res.render(__dirname + '/views/registration_confirmation_trader.ejs', { dematID: data.demat_id });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=trader')
      }
    } else if (role === "company") {
      try {
        const data = await query.registerCompany(req.body);
        res.render(__dirname + '/views/registration_confirmation_company.ejs');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=company')
      }
    } else if (role === "broker") {
      try {
        const selectedExchanges = typeof req.body.exchanges === 'string' ? [req.body.exchanges] : req.body.exchanges || [];
        console.log(selectedExchanges);
        req.body.exchanges = selectedExchanges
        const data = await query.registerBroker(req.body);
        res.render(__dirname + '/views/registration_confirmation_broker.ejs', { brokerID: data.broker_id });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=broker')
      }
    }
  }
});



//Route for portfolio
app.get('/portfolio', async (req, res) => {
  try {
    // Render the dashboard page with the user's information
    const data = await query.getCompaniesData();
    // console.log(data);
    res.render(__dirname + '/views/view_my_portfolio.ejs', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving portfolio');
  }
});


app.get('/buy_stock', async (req, res) => {
  console.log("get buy_stock")
  try {
    // Render the dashboard page with the user's information
    const user = JSON.parse(decodeURIComponent(req.query.data));
    const data = await query.getCompaniesData();
    const exchanges = await query.getExchangeNamesFromBrokerId(user.broker_id);
    data.exchanges = exchanges.map(exchange => exchange.exchange_name);
    console.log(data);
    res.render(__dirname + '/views/buy_stock.ejs', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving portfolio');
  }
});

app.post('/buy_stock', async (req, res) => {
  console.log("post buy_stock")
  try {
    console.log("post buy_stock")
    const data = req.body
    query.eventAddBuyStocks(data)
    // console.log(data)
    res.status(200).send('Success')
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving portfolio');
  }
})

app.post('/approved_stocks', async (req, res) => {
  console.log("post approvedStocks")
  try {
    console.log("post approvedStocks")
    const data = req.body
    console.log(data)
    // query.approvedStocks(data)
    res.status(200).send('Success')
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving portfolio');
  }
})

app.get('/sell_stock', async (req, res) => {
  console.log("sell stocks")
  console.log(req.body)
  console.log(req.query)
  const role = req.query.role;
  const data = JSON.parse(decodeURIComponent(req.query.data));
  try {
    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/sell_stocks.ejs', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving page');
  }
});

app.get('/broker_buy', async (req, res) => {
  console.log("get broker buy")
  const data = JSON.parse(decodeURIComponent(req.query.data));
  const broker_buy_by_exchange = await query.getBrokerBuyDetailsFromName(data.broker_name)
  for (let exchange in broker_buy_by_exchange) {
    for (let i = 0; i < broker_buy_by_exchange[exchange].length; i++) {
      let symbol = broker_buy_by_exchange[exchange][i].symbol;
      let price = await query.getPriceFromSymbol(symbol);
      broker_buy_by_exchange[exchange][i].price = price;
    }
  }  
  console.log(broker_buy_by_exchange)
  try{
    res.render(__dirname + '/views/broker_buy.ejs', { data:broker_buy_by_exchange });
  }catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving page');
  }
});

app.post('/main_table', async (req, res) => { 
  console.log("post main_table")
  const data = req.body
  console.log(data)
  try {
    const result = await query.getMainTableData(data);
    res.status(200).send(result);
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving page');
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  console.log("post login")
  const role = req.body.role;
  console.log(req.body);
  if (role) {
    if (role === "trader") {
      try {
        const { demat_id, password } = req.body;
        const user = await query.getUserByDematId(demat_id);
        console.log("trader", user)
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            const encodedData = encodeURIComponent(JSON.stringify(user));
            res.redirect(`/dashboard?role=trader&data=${encodedData}`);
          }
        });
      } catch (err) {
        console.error(err);
        res.status(401).send('Invalid login credentials');
      }
    } else if (role === "company") {
      try {
        const { gst_number, password } = req.body;
        const data = await query.getCompanyByGstNumber(gst_number);
        console.log("company", data)
        bcrypt.compare(password, data.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            res.render(__dirname + '/views/company_page1.ejs', { data });
          }
        });
      } catch (err) {
        console.error(err);
        res.status(401).send('Invalid login credentials');
      }
    } else if (role === "broker") {
      try {
        const { broker_id, password } = req.body;
        const data = await query.getBrokerDetails(broker_id);
        // console.log(data);
        bcrypt.compare(password, data.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            const encodedBroker = encodeURIComponent(JSON.stringify(data));
            res.redirect(`/dashboard?role=broker&data=${encodedBroker}`);
          }
        });
      } catch (err) {
        console.error(err);
        res.status(401).send('Invalid login credentials');
      }
    } else {
      res.status(400).send('Invalid role');
    }
  } else {
    res.status(400).send('Role is required');
  }
});

app.post('/prices', async (req, res) => {
  console.log("post prices")
  const companySymbol = req.query.symbol;
  const newPrice = req.body.price;

  console.log(req.query)
  console.log(req.body)
  try {
    const updateCompanyQuery = 'UPDATE Companies SET price = $1 WHERE symbol = $2';
    const updateCompanyValues = [newPrice, companySymbol];
    await pool.query(updateCompanyQuery, updateCompanyValues);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating company price');
  }
});



app.get('/', (req, res) => {
  console.log("get /")
  res.render(__dirname + '/views/controller.ejs')
})

app.get('/*', async (req, res) => {
  console.log("get /*")
  res.render(__dirname + '/views/404.ejs', { req, title: "Page Not Found" })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
  console.log(`http://localhost:${port}`)
})