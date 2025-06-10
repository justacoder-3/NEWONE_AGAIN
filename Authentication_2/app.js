// main server
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const routes = require('./index.js');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = MongoStore.create({
    mongoUrl : process.env.MONGO_URI,
    collectionName : 'temp'
})

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,   
        secure: process.env.NODE_ENV === 'production'
    }
}));

require('./passport.js');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

app.use(routes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(3000, () => {
            console.log('Listening on port 3000');
        });
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err);
    });
