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
  res.render( __dirname + '/views/register.ejs')
})

app.get('/reset',(req, res) => {
  query.resetDatabase();
  res.redirect( '/register')
})

app.get('/dashboard/:id', async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.params.id;
    // Get the user from the database based on the user ID
    const data = await query.getUserByDematId(userId);
    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/dashboard.ejs', { data, demat_id:userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving user information');
  }
});

//post requests
app.post('/register', async (req, res) => {
  console.log(req.body);
  if(req.body){
    try {
      const dematID = await query.registerUser(req.body);
      res.render(__dirname + '/views/registration_confirmation.ejs', { dematID:dematID });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error inserting user data');
      res.redirect('/register')
    }
  }else{
    res.status(500).send('Data not recieved');
    res.redirect('/register')
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
        res.redirect(`/dashboard/${demat_id}`);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(401).send('Invalid login credentials');
  }
});

app.get('/',(req, res) => {
  res.render(__dirname + '/views/register_company.ejs')
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})