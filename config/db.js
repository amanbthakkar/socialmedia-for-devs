const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //using the config package, we can get default variable values

//make a function to connect to DB which we can call from our server.js
const connectDB = async () => {
  //usually async functions have a try catch block, so we can do something on error
  try {
    //mongoose.connect() returns a promise so we put an await in front of that
    //async awaits are used to make our code look like it's syncronous even though it's not
    //it's new standard compared to using .then() and .catch, so we will use that

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); //exit with failure
  }
};

module.exports = connectDB;
