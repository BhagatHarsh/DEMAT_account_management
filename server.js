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
app.use(bodyParser.json());
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
  if(role === "trader") {
    const brokerNames = await query.getBrokerNames();
    res.render(__dirname + `/views/register_trader`, { brokerNames });
  }else
  res.render(__dirname + `/views/register_${role}`)
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
app.get('/portfolio', async(req,res)=> {
  console.log("my portfolio")
  const role = req.query.role;
  console.log(role)
  try {
    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/view_my_portfolio.ejs', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving portfolio');
  }



})

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
        const data = await query.getBrokerById(broker_id);
        bcrypt.compare(password, broker.password, (err, isMatch) => {
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

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
  console.log(`http://localhost:${port}`)
})