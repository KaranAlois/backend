require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

class MongoServices {
  // MongoDB connection URI
  uri = process.env.MONGOOSE_URL_LEGO;

  //  Function to connect to the MongoDB database
  connect = async () => {
    const client = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      return client.db();
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  };

  // Create a new document in the specified collection
  createDocument = async (collectionName, data) => {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    const result = await collection.insertOne(data);
    console.log(
      `Inserted a new document into ${collectionName} with ID: ${result.insertedId}`
    );

    return result.insertedId;
  };

  // Read documents from the specified collection
  readDocument = async (collectionName, query = {}) => {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    const documents = await collection.find(query).toArray();

    return documents;
  };

  // Update a document in the specified collection
  updateDocument = async (collectionName, uniqueParam, newData) => {
    const db = await this.connect();
    const collection = db.collection(collectionName);
    console.log("param", uniqueParam);
    console.log("newData", newData);
    const result = await collection.updateOne(uniqueParam, { $set: newData });

    if (result.modifiedCount === 1) {
      console.log(`Updated document with ID ${result} in ${collectionName}`);
      return true;
    } else {
      console.log(`Document with ID ${result} not found in ${collectionName}`);
      return false;
    }
  };

  // Delete a document from the specified collection
  deleteDocument = async (collectionName, query = {}) => {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 1) {
      console.log(`Deleted document with ID ${id} from ${collectionName}`);
      return true;
    } else {
      console.log(`Document with ID ${id} not found in ${collectionName}`);
      return false;
    }
  };

  // Delete multiple document from collection.
  deleteManyDocuments = async (collectionName, query = {}) => {
    const db = await this.connect();
    const collection = db.collection(collectionName);

    const result = await collection.deleteMany(query);

    if (result.deletedCount) {
      console.log(`Delete ${result.deletedCount} documents`);
      return true;
    } else {
      console.log(`Document not found`);
    }
  };
}

module.exports = new MongoServices();
