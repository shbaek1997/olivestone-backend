//set up connection with mongo db
const mongoose = require("mongoose");

const DB_URL = process.env.MONGO_DB_URL;
console.log(DB_URL);

module.exports = () => {
  function connectDB() {
    mongoose.connect(DB_URL, function (err) {
      if (err) {
        console.error("Mongo DB Connection Error", err);
      }
      console.log("Connected to MongoDB");
    });
  }
  connectDB();
  mongoose.connection.on("disconnected", connectDB);
};
