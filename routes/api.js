const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.jwtProvided) {
    console.log("Denied: Authentication required");
    return res.status(401).send('Authentication required');
  } else if (req.jwtVerifyError || req.jwtExpired) {
    console.log("Denied: Invalid authentication token");
    return res.status(401).send('Invalid authentication token');
  }
  next();
}

function isAdmin(req, res, next) {
  if (req.jwtPayload && req.jwtPayload.userIsAdmin) {
    next();
  } else {
    console.log("Denied: Admin privileges required");
    res.status(403).send('Admin privileges required');
  }
}

// Update user endpoint
router.put('/user/update', isLoggedIn, async (req, res) => {
  try {
    const newUserData = req.body
    const updatedUser = await db.user.updateUser(req.jwtPayload.userMail, newUserData);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error updating user');
    console.error(error)
  }
});

// Get all users endpoint
router.get('/user/all', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await db.user.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
    console.error(error)
  }
});

// Add new suggestion endpoint
router.post('/suggestion/party/:partyName/add', isLoggedIn, async (req, res) => {
  try {
    const newSuggestion = req.body
    newSuggestion.active = true
    newSuggestion.contributor = req.jwtPayload.userMail
    newSuggestion.partyName = req.params.partyName
    newSuggestion.votes = 0

    if(newSuggestion.active === undefined || 
       newSuggestion.votes === undefined  || 
       newSuggestion.contributor === undefined  || 
       newSuggestion.partyName === undefined  || 
       newSuggestion.title === undefined || 
       newSuggestion.description === undefined  || 
       newSuggestion.link === undefined ) {
      return res.status(400).send(`Missing information in suggestion.
      newSuggestion.active: ${newSuggestion.active}
      newSuggestion.votes: ${newSuggestion.votes}
      newSuggestion.contributor: ${newSuggestion.contributor}
      newSuggestion.partyName: ${newSuggestion.partyName}
      newSuggestion.title: ${newSuggestion.title}
      newSuggestion.description: ${newSuggestion.description}
      newSuggestion.link: ${newSuggestion.link}
      ` );
    }
    const existingSuggestion = await db.suggestion.findPartySuggestionByTitle(newSuggestion.title, req.params.partyName)
    if(existingSuggestion) {
      return res.status(409).send('Suggestion with same name already exists');
    }

    const ack = await db.suggestion.addSuggestion(newSuggestion);
    newSuggestion._id = ack.insertedId
    res.status(201).json(newSuggestion);
  } catch (error) {
    res.status(500).send('Error adding suggestion');
    console.error(error)
  }
});

// Find suggestion by ID endpoint
router.get('/suggestion/id/:id', async (req, res) => {
  try {
    const suggestion = await db.suggestion.findSuggestionById(req.params.id);
    res.json(suggestion);
  } catch (error) {
    res.status(404).send('Suggestion not found');
    console.error(error)
  }
});

// Get all suggestions endpoint
router.get('/suggestion/all', async (req, res) => {
  try {
    const suggestions = await db.suggestion.findAllSuggestions();
    res.json(suggestions);
  } catch (error) {
    res.status(500).send('Error fetching all suggestions');
    console.error(error)
  }
});

// Get all active suggestions endpoint
router.get('/suggestion/active', async (req, res) => {
  try {
    const activeSuggestions = await db.suggestion.findActiveSuggestions();
    res.json(activeSuggestions);
  } catch (error) {
    res.status(500).send('Error fetching active suggestions');
    console.error(error)
  }
});

// Find suggestions by contributor endpoint
router.get('/suggestion/contributor/:contributor', async (req, res) => {
  try {
    const suggestions = await db.suggestion.findSuggestionsByContributor(req.params.contributor);
    res.json(suggestions);
  } catch (error) {
    res.status(404).send('No suggestions found for this contributor');
    console.error(error)
  }
});

// Find suggestion by title endpoint
router.get('/suggestion/party/:partyName/title/:title', async (req, res) => {
  try {
    const suggestion = await db.suggestion.findPartySuggestionByTitle(req.params.title, req.params.partyName);
    res.json(suggestion);
  } catch (error) {
    res.status(404).send('Suggestion not found');
    console.error(error)
  }
});

// Get all active suggestions for given party endpoint
router.get('/suggestion/party/:partyName/active', async (req, res) => {
  try {
    const activeSuggestions = await db.suggestion.findActivePartySuggestions(req.params.partyName);
    res.json(activeSuggestions);
  } catch (error) {
    res.status(500).send('Error fetching active suggestions: ' + error);
    console.error(error)
  }
});

// Increment suggestion vote endpoint
router.post('/suggestion/party/:partyName/votefor/:title', async (req, res) => {
  try {
    const ack = await db.suggestion.incrementPartySuggestionVote(req.params.title, req.params.partyName);
    res.json(await db.suggestion.findSuggestionById(ack.upsertedId));
  } catch (error) {
    res.status(500).send('Error incrementing vote');
    console.error(error)
  }
});

// Decrement suggestion vote endpoint
router.post('/suggestion/party/:partyName/voteagainst/:title', async (req, res) => {
  try {
    const ack = await db.suggestion.decrementPartySuggestionVote(req.params.title, req.params.partyName);
    res.json(await db.suggestion.findSuggestionById(ack.upsertedId));
  } catch (error) {
    res.status(500).send('Error decrementing vote');
    console.error(error)
  }
});

// Deactivate suggestion endpoint
router.put('/suggestion/party/:partyName/deactivate/:title', async (req, res) => {
  try {
    const ack = await db.suggestion.deactivatePartySuggestion(req.params.title, req.params.partyName);
    res.json(await db.suggestion.findSuggestionById(ack.upsertedId));
  } catch (error) {
    res.status(500).send('Error deactivating suggestion');
    console.error(error)
  }
});

// Update suggestion data endpoint
router.put('/suggestion/party/:partyName/update/:title', async (req, res) => {
  try {
    const newSuggestionData = req.body
    const ack = await db.suggestion.updatePartySuggestion(req.params.title, req.params.partyName, newSuggestionData);
    res.json(await db.suggestion.findSuggestionById(ack.upsertedId));
  } catch (error) {
    res.status(500).send('Error updating suggestion');
    console.error(error)
  }
});

module.exports = router;
