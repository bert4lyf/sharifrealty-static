// Database configuration and utilities
// Using MongoDB for user storage

const mongodb = require('mongodb');

let cachedClient = null;

async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable not set');
    }

    const client = new mongodb.MongoClient(mongoUri);
    await client.connect();
    cachedClient = client;
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function getDB() {
  const client = await connectDB();
  return client.db('sharifrealty');
}

async function getUsersCollection() {
  const db = await getDB();
  return db.collection('users');
}

module.exports = {
  connectDB,
  getDB,
  getUsersCollection
};
