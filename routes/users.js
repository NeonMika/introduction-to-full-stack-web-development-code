var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();

var users = [];

const saltRounds = 10; // You can adjust the number of rounds as necessary

router.get('/login', async function(req, res, next) {
    const { mail, pw } = req.query; // Extract mail and pw from URL parameters
    const user = users.find(user => user.mail === mail);
    if (user) {
        // Use bcrypt to compare submitted password with the hashed password
        const match = await bcrypt.compare(pw, user.pw);
        if (match) {
            // If the password is correct, send a success response
            res.send({ status: 'success', message: 'Login successful' });
        } else {
            // If the password is incorrect, send a fail status
            res.status(401).send({ status: 'fail', message: 'Invalid credentials' });
        }
    } else {
        // If the user is not found, send a fail status
        res.status(401).send({ status: 'fail', message: 'Invalid credentials' });
    }
});

router.get('/register', async function(req, res, next) {
    const { mail, pw } = req.query; // Extract mail and pw from URL parameters
    const userExists = users.some(user => user.mail === mail);
    if (userExists) {
        // If a user with the same mail is found, send a fail status
        res.status(409).send({ status: 'fail', message: 'User already exists' });
    } else {
        // Hash the password before storing it
        const hashedPw = await bcrypt.hash(pw, saltRounds);
        // Add the new user with the hashed password and send a success status
        users.push({ mail, pw: hashedPw });
        res.send({ status: 'success', message: 'Registration successful' });
    }
});

module.exports = router;
