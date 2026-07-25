const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");
const accountController = require("../controllers/account.controller.js");

const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */

router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccountController,
);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get(
  "/",
  authMiddleware.authMiddleware,
  accountController.getUserAccountsController,
);

/**
 * - GET /api/accounts/:accountId/balance
 * - Get the balance of a specific account
 * - Protected Route
 */
router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController,
);

router.post(
  "/:accountId/faucet",
  authMiddleware.authMiddleware,
  accountController.faucetController,
);
router.patch(
  "/:accountId/status",
  authMiddleware.authMiddleware,
  accountController.updateAccountStatusController,
);

module.exports = router;
