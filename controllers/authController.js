// controllers/authController.js

const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.signInUser(email, password);
        req.session.userId = user.id;
        res.redirect('/dashboard');
    } catch (error) {
        res.status(400).send('Invalid email or password');
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        await userModel.createUser(email, password);
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error registering');
    }
});

router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.send('Welcome to the dashboard! <a href="/logout">Logout</a>');
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

module.exports = router;
