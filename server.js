const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 3000
const db = require('./queries')
const path = require('path')

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine','ejs'); 
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);


//get requests
app.get('/', (req, res) => {
  res.render( __dirname + '/views/register.ejs')
})

app.get('/login',(req, res) => {
  response.render( __dirname + '/views/login.ejs')
})

app.get('/users', async (req, res) => {
  try {
    const val = await db.getUsers();
    // res.send(val)
    res.render(__dirname + '/views/AllUsers.ejs' , {data : val})
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving users from database');
  }
});


app.get('/dashboard/:id', async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.params.id;

    // Get the user from the database based on the user ID
    const data = await db.getUserById(userId);

    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/dashboard.ejs', { user: data.first_name });
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
      const confirmation = await db.registerUser(req.body);
      res.send(confirmation);
      res.render( __dirname + '/views/dashboard.ejs', {user: req.body.pan_number})
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

app.post('/login', async (req, res) => {
  try {
    const { pan_number, password } = req.body;

    const result = await loginUser({ pan_number, password });

    // Redirect the user to their specific page using their ID
    res.redirect(`/users/${result.pan_number}`);
  } catch (err) {
    console.error(err);
    res.status(401).send('Invalid login credentials');
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})