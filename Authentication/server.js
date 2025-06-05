const express = require('express');
const app = express();
const path = require('path');
const { auth } = require('express-openid-connect');
require('dotenv').config();

const port = process.env.PORT || 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

app.use(auth(config));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/authorized', function (req, res) {
    res.send(req.oidc.isAuthenticated() ? "Logged In" : "Logged Out");
});

app.get('/data', express.json(), function (req, res) {
  const username = req.oidc.user;
  const token = req.oidc.idToken;
  res.json({
    name : username,
    tokenid : token
  })
});

app.listen(port, () => {
  console.log('Running on port ', port);
});

