const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection string
const dbUser = process.env.DB_USER;
if (!dbUser) {
    console.error('FATAL ERROR: DB_USER env var is not defined.');
    process.exit(1); // Exit the process with an error code
}

const dbPw = process.env.DB_PW;
if (!dbUser) {
    console.error('FATAL ERROR: DB_PW env var is not defined.');
    process.exit(1); // Exit the process with an error code
}

const uri = `mongodb+srv://${dbUser}:${dbPw}@itfswdev.ubbyynv.mongodb.net/?retryWrites=true&w=majority&appName=ITFSWD`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;
let users = null;
let suggestions = null;

// Connect to the server and set the db variable
async function connectDB() {
  await client.connect();
  db = client.db('ITFSWD'); // use your database name here
  users = db.collection('users')
  suggestions = db.collection('suggestions')
  await db.command({ ping: 1 });
  console.log("Pinged DB successfully, connected to MongoDB!");
}

// Method to add a new user
async function addUser(user) {
  user.createdAt = new Date();
  return await users.insertOne(user);
}

// Method to add a new suggestion
async function addSuggestion(suggestion) {
  suggestion.createdAt = new Date();
  return await suggestions.insertOne(suggestion);
}

// Method to find a user by email
async function findUserByEmail(email) {
  return await users.findOne({ mail: email });
}

// Method to update a user's information
async function updateUser(mail, newData) {
  const updatedAt = new Date();
  newData.updatedAt = updatedAt;
  return await users.findOneAndUpdate({ mail: mail }, { $set: newData, $push: { changes: { at: newData.updatedAt, change: "edit" } } }, { returnNewDocument: true });
}

// Method to get all users
async function findAllUsers() {
  return await users.find({}).toArray();
}

// Method to get all suggestions
async function findAllSuggestions() {
  return await suggestions.find({}).toArray();
}

// Method to get all active suggestions
async function findActiveSuggestions() {
  return await suggestions.find({ active: true }).toArray();
}

// Method to find a user by ID
async function findUserById(id) {
  return await users.findOne({ _id: id });
}

// Method to find a suggestion by ID
async function findSuggestionById(id) {
  return await suggestions.findOne({ _id: id });
}

// Method to find all suggestions by a contributor
async function findSuggestionsByContributor(contributor) {
  return await suggestions.find({ contributor: contributor }).toArray();
}

// Method to find a suggestion by title
async function findPartySuggestionByTitle(title, partyName) {
  return await suggestions.findOne({ title: title, partyName : partyName });
}

// Method to get all active suggestions
async function findActivePartySuggestions(partyName) {
  return await suggestions.find({ active: true, partyName: partyName }).toArray();
}

// Method to increment a suggestion's vote
async function incrementPartySuggestionVote(title, partyName) {
  const updatedAt = new Date();
  return await suggestions.findOneAndUpdate({ title: title, partyName : partyName }, { $inc: { votes: 1 }, $push: { changes: { at: updatedAt, change: "upvote" } }, $set: { updatedAt: updatedAt } }, { returnNewDocument: true });
}

// Method to decrement a suggestion's vote
async function decrementPartySuggestionVote(title, partyName) {
  const updatedAt = new Date();
  return await suggestions.findOneAndUpdate({ title: title, partyName : partyName }, { $inc: { votes: -1 }, $push: { changes: { at: updatedAt, change: "downvote" } }, $set: { updatedAt: updatedAt } }, { returnNewDocument: true });
}

// Method to deactivate a suggestion
async function deactivatePartySuggestion(title, partyName) {
  const updatedAt = new Date();
  return await suggestions.findOneAndUpdate({ title: title, partyName : partyName }, { $set: { active: false, updatedAt: updatedAt }, $push: { changes: { at: updatedAt, change: "deactivate" } } }, { returnNewDocument: true });
}

// Method to update a suggestion's data
async function updatePartySuggestion(title, partyName, newData) {
  const updatedAt = new Date();
  newData.updatedAt = updatedAt;
  return await suggestions.findOneAndUpdate({ title: title, partyName: partyName, }, { $set: newData, $push: { changes: { at: updatedAt, change: "edit" } } }, { returnNewDocument: true });
}

// Connect to the database upon startup and stop server on error
connectDB().catch(error => {
  console.error(error);
  process.exit(1);
})

module.exports = {
  user: {
    addUser,
    updateUser,
    findUserByEmail,
    findUserById,
    findAllUsers
  },
  suggestion: {
    // General suggestion methods
    addSuggestion,
    findSuggestionById,
    findAllSuggestions,
    findActiveSuggestions,
    findSuggestionsByContributor,

    // Party-specific suggestion methods
    findPartySuggestionByTitle,
    incrementPartySuggestionVote,
    decrementPartySuggestionVote,
    deactivatePartySuggestion,
    findActivePartySuggestions,
    updatePartySuggestion
  }
};
