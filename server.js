const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const query = require('./queries')
const path = require('path')
const bcrypt = require('bcrypt')

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine','ejs'); 
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);


//get requests
app.get('/login', (req, res) => {
  const role = req.query.role;
  console.log(role)
  res.render(__dirname + `/views/login_${role}`)
});


app.get('/register',(req, res) => {
  const role = req.query.role;
  console.log(role)
  res.render(__dirname + `/views/register_${role}`)
})

app.get('/reset',(req, res) => {
  query.resetDatabase();
  res.redirect( '/')
})

app.get('/dashboard', async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.query.id;
    // Get the user from the database based on the user ID
    const data = await query.getUserByDematId(userId);
    console.log(data)
    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/dashboard.ejs', { data, demat_id:userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving user information');
  }
});

//post requests
app.post('/register', async (req, res) => {
  const role = req.body.role;
  console.log(req.body);
  if(role){
    if(role === "trader"){
      try {
        const data = await query.registerTrader(req.body);
        res.render(__dirname + '/views/trader_page1.ejs', { dematID: data.demat_id });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=trader')
      }
    }else if(role === "company"){
      try {
        const data = await query.registerCompany(req.body);
        // res.redirect(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
        res.send(data)
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=company')
      }
    }else if(role === "broker"){
      try {
        const dematID = await query.registerBroker(req.body);
        res.render(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register?role=broker')
      }
    }
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  const role = req.body.role;
  console.log(req.body);
  if (role) {
    if (role === "trader") {
      try {
        const { pan_number, password } = req.body;
        const user = await query.getTraderByPanNumber(pan_number);
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            res.redirect(`/trader?id=${pan_number}`);
          }
        });
      } catch (err) {
        console.error(err);
        res.status(401).send('Invalid login credentials');
      }
    } else if (role === "company") {
      try {
        const { gst_number, password } = req.body;
        const company = await query.getCompanyByGstNumber(gst_number);
        console.log("company", company)
        bcrypt.compare(password, company.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            res.redirect(`/company?id=${company.symbol}`);
          }
        });
      } catch (err) {
        console.error(err);
        res.status(401).send('Invalid login credentials');
      }
    } else if (role === "broker") {
      try {
        const { broker_id, password } = req.body;
        const broker = await query.getBrokerById(broker_id);
        bcrypt.compare(password, broker.password, (err, isMatch) => {
          if (err) {
            res.status(401).send('Invalid login credentials');
          } else if (!isMatch) {
            res.status(401).send('Invalid login credentials');
          } else {
            res.redirect(`/broker?id=${broker_id}`);
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
  const companySymbol = req.query.company_name;
  const newPrice = req.body.price;

  try {
    const updateCompanyQuery = 'UPDATE Companies SET price = $1 WHERE symbol = $2';
    const updateCompanyValues = [newPrice, companySymbol];
    await pool.query(updateCompanyQuery, updateCompanyValues);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating company price');
  }
});



app.get('/',(req, res) => {
  res.render(__dirname + '/views/controller.ejs')
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
  console.log(`http://localhost:${port}`)
})