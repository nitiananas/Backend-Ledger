const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("server is connected to DB");
    return mongoose.connection;
  } catch (err) {
    console.error("Error connecting to DB:", err.message);
    process.exit(1);
  }
}

module.exports = connectToDB;
