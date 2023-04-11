const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 3000
const query = require('./queries')
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
  res.render( __dirname + '/views/login.ejs')
})

app.get('/data', async (req, res) => {
  try {
    const allUserData = await query.getAllUserData();
    const allDematData = await query.getAllDematData();
    const allPhoneNumberData = await query.getAllPhoneNumberData();
    const allBankDetailsData = await query.getAllBankDetailsData();

    // merge data from all tables
    const data = allUserData.map(async user => {
      const demat = allDematData.find(d => d.pan_number === user.pan_number);
      const phoneNumberData = allPhoneNumberData.find(p => p.pan_number === user.pan_number);
      const bankDetailsData = allBankDetailsData.find(b => b.ifsc_code === phoneNumberData.ifsc_code);

      // If bank details not found, retrieve them from the database
      if (!bankDetailsData) {
        const bank = await query.getBankDetailsByIFSC(phoneNumberData.ifsc_code);
        console.log("bank" + bank)
        bankDetailsData = {
          ifsc_code: bank.ifsc_code,
          bank_name: bank.bank_name,
          account_number: null // Update this with your default value for account number
        };
      }

      return {
        pan_number: user.pan_number,
        first_name: user.first_name,
        last_name: user.last_name,
        pincode: user.pincode,
        phone_number: phoneNumberData.phone_number,
        ifsc_code: phoneNumberData.ifsc_code,
        bank_name: bankDetailsData.bank_name,
        account_number: bankDetailsData.account_number,
        demat_id: demat ? demat.demat_id : null
      };
    });

    res.render(__dirname + '/views/data.ejs', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while retrieving user data');
  }
});


app.get('/reset',(req, res) => {
  query.resetDatabase();
  res.render( __dirname + '/views/register.ejs')
})


app.get('/dashboard/:id', async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.params.id;

    // Get the user from the database based on the user ID
    const data = await query.getUserById(userId);

    // Render the dashboard page with the user's information
    res.render(__dirname + '/views/dashboard.ejs', { user: data.first_name });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving user information');
  }
});

// app.get('/demat/:id', function(req, res) {
//   // Retrieve user's Demat account information from the database
//   var pan_number = req.params.id; // assuming the PAN number is stored in the session object
//   // Use the PAN number to query the database and retrieve the user's Demat account information

//   // Pass the user's Demat account information to the demat.ejs template
//   res.render('demat', { demat_info: demat_info });
// });




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