var express = require('express')
var router = express.Router()

var users = []

router.get('/login', function(req, res, next) {
    const { mail, pw } = req.query; // Extract mail and pw from URL parameters
    const userExists = users.some(user => user.mail === mail && user.pw === pw);
    if (userExists) {
        // If the user is found, send a success response
        res.send({ status: 'success', message: 'Login successful' });
    } else {
        // If the user is not found, send a fail status
        res.status(401).send({ status: 'fail', message: 'Invalid credentials' });
    }
})

router.get('/register', function(req, res, next) {
    const { mail, pw } = req.query; // Extract mail and pw from URL parameters
    const userExists = users.some(user => user.mail === mail);
    if (userExists) {
        // If a user with the same mail is found, send a fail status
        res.status(409).send({ status: 'fail', message: 'User already exists' });
    } else {
        // Add the new user and send a success status
        users.push({ mail, pw });
        res.send({ status: 'success', message: 'Registration successful' });
    }
})

module.exports = router;
