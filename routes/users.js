var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var jwt = require('jsonwebtoken');
var db = require('../database');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

// Login endpoint
router.post('/login', async function(req, res) {
    const { mail, pw } = req.body;
    if (!mail || !pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing email or password' });
    }

    try {
        const user = await db.user.findUserByEmail(mail);
        if (user && await bcrypt.compare(pw, user.pw)) {
            const token = jwt.sign({ userMail: user.mail, userIsAdmin: user.mail.toLowerCase().startsWith('admin') }, jwtSecret, { expiresIn: '1h' });
            res.send({ status: 'success', message: 'Login successful', token: token, expiresAt: Date.now() + 3600000});
        } else {
            res.status(401).send({ status: 'fail', message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).send({ status: 'fail', message: 'Server error' });
    }
});

// Registration endpoint
router.post('/register', async function(req, res) {
    const { mail, pw } = req.body;
    if (!mail || !pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing email or password' });
    }

    try {
        const userExists = await db.user.findUserByEmail(mail);
        if (userExists) {
            res.status(409).send({ status: 'fail', message: 'User already exists' });
        } else {
            const hashedPw = await bcrypt.hash(pw, saltRounds);
            await db.user.addUser({ mail, pw: hashedPw });
            res.send({ status: 'success', message: 'Registration successful' });
        }
    } catch (error) {
        res.status(500).send({ status: 'fail', message: 'Server error' });
    }
});

module.exports = router;
