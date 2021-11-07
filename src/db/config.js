const stageConfig = {
  PROD: {
    URL: process.env.MONGO_URL,
    DB_NAME: process.env.MONGO_DB_NAME
  },
  DEV: {
    URL: 'mongodb://localhost:27017/',
    DB_NAME: 'cryptoWarehouse'
  }
};

export { stageConfig };