'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();

require('dotenv').config();

app.get('/oauth/google/code', function(req, res) {
  if (!req.query.code) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    console.log('CODE:', req.query.code);
    superagent.post('https://www.googleapis.com/oauth2/v4/token')
      .type('form')
      .send({
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google/code`
      })
      .then (response => {
        console.log('Response AFTER code is given');
        console.log('access token:', response.body.access_token);
        console.log('id token:', response.body.id_token);
        let idTokenPayload = response.body.id_token.split('.')[1];
        let decoded = Buffer.from(idTokenPayload, 'base64').toString();
        let json = JSON.parse(decoded);
        console.log('decoded:', decoded);
        // handle oauth login
        res.cookie('X-Some Cookie', idTokenPayload);
        res.write('<h1>' + json.email + '</h1>');
        res.end();
      })
      .catch(response => {
        console.log('response', response);
      });
  }
});

app.get('/auth-test', (req, res) => {
  res.sendFile('./index.html', {root: './'});
});

app.listen(3000, () => {
  console.log('listen on port 3000');
});