require("dotenv").config();

const app = require("./src/app.js");
const connectToDB = require("./src/config/db.js");

(async () => {
  try {
    await connectToDB();
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  } catch (err) {
    console.error("Unable to start server:", err.message);
    process.exit(1);
  }
})();
