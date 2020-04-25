// Section 1
const cors = require('cors');
const express = require('express');
const axios = require('axios');

// Section 2
const app = express();

app.use(cors());

// Section 3
app.get('/', (req, res) => { 
 res.send("<h1>Home page</h1>");
});

app.get('/users', (req, res) => {
 axios.get('https://randomuser.me/api/?page=1&results=10')
  .then(response => {
    res.send(response.data);
  });
});

// Section 4
app.listen(3000, () => {
 console.log('server started on port 3000');
});
