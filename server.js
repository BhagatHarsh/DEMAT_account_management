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
  res.redirect( '/register')
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
        const dematID = await query.registerTrader(req.body);
        res.render(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register')
      }
    }else if(role === "company"){
      try {
        const dematID = await query.registerCompany(req.body);
        res.render(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register')
      }
    }else if(role === "broker"){
      try {
        const dematID = await query.registerBroker(req.body);
        res.render(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting user data');
        res.redirect('/register')
      }
    }
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  try {
    const { demat_id, password } = req.body;

    const user = await query.getUserByDematId(demat_id);
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        res.status(401).send('Invalid login credentials');
      } else if (!isMatch) {
        res.status(401).send('Invalid login credentials');
      } else {
        res.redirect(`/dashboard?id=${demat_id}`);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(401).send('Invalid login credentials');
  }
});

app.get('/',(req, res) => {
  res.render(__dirname + '/views/controller.ejs')
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
  console.log(`http://localhost:${port}`)
})