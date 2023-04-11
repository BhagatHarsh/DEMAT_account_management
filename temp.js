

const {Pool,Client}= require('pg')



const connectionString='postgressql://postgres:123@localhost:5432/postgres'


//Creating Client
const client= new Client({
    connectionString:connectionString
})




////////////////////////////////////////// PSQL Query//////////////////////////////




client.connect()
client.query('Select * from public."users"',(err,res)=> {
   console.log(err,res)
   //client.end()
 })






