const {Client} = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'bhaguu',
    port: 5432,
    password: '123',
    database: 'stock'
})

client.connect()

client.query('SELECT * FROM users', (err, res) => {
    if(!err){
        console.log(res.rows);
    }else{
        console.log(err.message);
    }
    client.end;
})