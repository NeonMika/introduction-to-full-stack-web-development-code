var express = require('express')
var bcrypt = require('bcrypt')
var router = express.Router()
var jwt = require('jsonwebtoken')

var users = []

const saltRounds = 10

// On Windows: set JWT_SECRET=yourSecretKey or $env:JWT_SECRET="yourSecretKey"
// On Linux: export JWT_SECRET=yourSecretKey
const jwtSecret = process.env.JWT_SECRET

router.get('/login', async function(req, res, next) {
    const { mail, pw } = req.query
    // Check if either mail or password is missing and provide specific messages
    if (!mail && !pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing email and password' });
    } else if (!mail) {
        return res.status(400).send({ status: 'fail', message: 'Missing email' });
    } else if (!pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing password' });
    }

    const user = users.find(user => user.mail === mail)
    if (user) {
        const match = await bcrypt.compare(pw, user.pw)
        if (match) {
            const data = { userMail: user.mail }
            // console.log("login, data: ", data)
            const token = jwt.sign(data, jwtSecret, { expiresIn: '1h' })
            // console.log("login, token generated: ", token)
            // const dataDecoded = jwt.verify(token, jwtSecret)
            // console.log("login, token decoded: ", dataDecoded)
            res.send({ status: 'success', message: 'Login successful', token: token })
        } else {
            res.status(401).send({ status: 'fail', message: 'Invalid credentials' })
        }
    } else {
        res.status(401).send({ status: 'fail', message: 'Invalid credentials' })
    }
})

router.get('/register', async function(req, res, next) {
    const { mail, pw } = req.query

    // Check if either mail or password is missing and provide specific messages
    if (!mail && !pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing email and password' });
    } else if (!mail) {
        return res.status(400).send({ status: 'fail', message: 'Missing email' });
    } else if (!pw) {
        return res.status(400).send({ status: 'fail', message: 'Missing password' });
    }

    const userExists = users.some(user => user.mail === mail)
    if (userExists) {
        res.status(409).send({ status: 'fail', message: 'User already exists' })
    } else {
        const hashedPw = await bcrypt.hash(pw, saltRounds)
        users.push({ mail, pw: hashedPw })
        res.send({ status: 'success', message: 'Registration successful' })
    }
})

// A secured resource example
router.get('/testAuth', function(req, res) {
    if (!req.jwtProvided) {
        return res.status(403).send({ status: 'fail', message: 'No token provided.' })
    }
    if (req.jwtVerifyError) {
        if (req.jwtExpired) {
            return res.status(401).send({ status: 'fail', message: 'Token has expired.' })
        }
        return res.status(500).send({ status: 'fail', message: 'Failed to authenticate token.' })
    }
    console.log(req.jwtPayload)
    if (req.jwtPayload && req.jwtPayload.userMail.toLowerCase().startsWith('admin')) {
        res.send({ status: 'success', message: 'Authenticated as ADMIN' })
    } else {
        res.status(403).send({ status: 'fail', message: 'Forbidden: Not an ADMIN' })
    }
})


module.exports = router
