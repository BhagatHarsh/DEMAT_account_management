const express = require('express')
const app = express()
const port = 3000
const db = require('./queries')
const {pool} = require('./dbConfig')

app.use(express.json())

app.get('/', (request, response) => {

  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', async (req, res) => {
  const val = await db.getUsers()
  res.send(val[0])
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})