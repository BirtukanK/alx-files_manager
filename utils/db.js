const { MongoClient } = require('mongodb');
require('dotenv').config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Connected successfully to MongoDB server');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  isAlive() {
    return this.client && this.client.isConnected();
  }

  async nbUsers() {
    try {
      const collection = this.db.collection('users');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      return -1; // or handle the error as needed
    }
  }

  async nbFiles() {
    try {
      const collection = this.db.collection('files');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      return -1; // or handle the error as needed
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
