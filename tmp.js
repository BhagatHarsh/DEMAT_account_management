require('dotenv').config();
const {Client} = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
}
)

client.connect()

client.query('SELECT * FROM users', (err, res) => {
    if(!err){
        console.log(res.rows);
    }else{
        console.log(err.message);
    }
    client.end;
})