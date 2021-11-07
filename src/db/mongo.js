import MongoDB from 'mongodb';

import { stageConfig } from './config.js';

const STAGE_PARAMETER = process.env.STAGE;
const mongoClient = MongoDB.MongoClient;
const mongoURL = stageConfig[STAGE_PARAMETER].URL;
const mongoDBName = stageConfig[STAGE_PARAMETER].DB_NAME;

const mongoCreateDocument = (collectionName, document) => {

  mongoClient.connect(mongoURL, (err, db) => {
    if (err) throw err;
    db.db(mongoDBName).collection(collectionName).insertOne(document, (err, res) => {
      if (err) throw err;
      db.close();
    });
  });

};

const mongoUpdateDocument = (collectionName, symbol, timestamp, newValue) => {

  mongoClient.connect(mongoURL, (err, db) => {
    if (err) throw err;
    const query = { symbol: symbol, timestamp: timestamp };
    const values = { $push: { ohlc: newValue } };
    db.db(mongoDBName).collection(collectionName).updateOne(query, values, (err, res) => {
      if (err) throw err;
      db.close();
    });
  });
  
};

const mongoCheckDocumentExists = async (collectionName, symbol, timestamp) => {

  const db = await mongoClient.connect(mongoURL);
  const query = { symbol: symbol, timestamp: timestamp };
  const exists = await db.db(mongoDBName).collection(collectionName).findOne(query);
  db.close();

  if (exists === null || exists === undefined) return false;
  else return true;

};

export {
  mongoClient,
  mongoURL,
  mongoCreateDocument,
  mongoUpdateDocument,
  mongoCheckDocumentExists
}