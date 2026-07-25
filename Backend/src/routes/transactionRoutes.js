const { Router } = require('express')
const authMiddleware=require('../middlewares/auth.middleware.js')
const {
  createTransaction,
  createInitialFundsTransaction,
  getTransactionHistory,
} = require("../controllers/transaction.controller.js");

const transactionRoutes=Router();

/**
 * - GET /api/transactions/
 * - Get transaction history of user
 */
transactionRoutes.get(
  "/",
  authMiddleware.authMiddleware,
  getTransactionHistory
);

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRoutes.post(
  "/",
  authMiddleware.authMiddleware,
  createTransaction
);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds trandaction for system user
 */

transactionRoutes.post(
  "/system/initial-funds",
  authMiddleware.systemUserMiddleware,
  createInitialFundsTransaction
);

module.exports=transactionRoutes;