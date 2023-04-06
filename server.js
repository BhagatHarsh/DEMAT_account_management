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


//requests
app.get('/', (request, response) => {
  response.render( __dirname + '/views/register.ejs')
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

app.post('/users/register', async (req, res) => {
  console.log(req.body);
  try {
    const confirmation = await db.registerUser(req.body);
    res.send(confirmation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting user data');
  }
});

// app.post('/login', async (req, res) => {
//   console.log(req.body)
//   try{
//     const 
//   }
// })


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})