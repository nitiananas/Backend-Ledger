const express=require("express");
const cookieParser=require("cookie-parser")



const app=express();

/**
 * - Routes required
 */

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


/**
 * - Routes used
 */

const authRouter = require("./routes/auth.routes.js");
const accountRouter = require("./routes/accounts.routes.js");
const transactionRoutes=require("./routes/transactionRoutes.js")


app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRoutes)
module.exports=app;