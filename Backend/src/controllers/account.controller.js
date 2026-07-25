const accountModel = require("../models/account.model.js");
const userModel = require("../models/user.model.js");
const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/Ledger.model.js");
const mongoose = require("mongoose");

async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  res.status(201).json({
    account,
  });
}

async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({
    user: req.user._id,
  });
  res.status(200).json({
    accounts,
  });
}

async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });
  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }
  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance: balance,
  });
}

async function faucetController(req, res) {
  const { accountId } = req.params;
  const amount = 10000;

  try {
    const targetAccount = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!targetAccount) {
      return res.status(404).json({
        message: "Account not found or not owned by you",
      });
    }

    if (targetAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Target account is not ACTIVE",
      });
    }

    let systemUser = await userModel.findOne({ email: "system@ledger.com" }).select("+systemUser");
    if (!systemUser) {
      systemUser = new userModel({
        email: "system@ledger.com",
        name: "System Faucet",
        password: "system_faucet_secure_pwd_123",
      });
      systemUser.set("systemUser", true);
      await systemUser.save();
    }

    let systemAccount = await accountModel.findOne({ user: systemUser._id });
    if (!systemAccount) {
      systemAccount = await accountModel.create({
        user: systemUser._id,
        currency: "INR",
        status: "ACTIVE",
      });
    }

    const idempotencyKey = `faucet-${accountId}-${Date.now()}`;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = new transactionModel({
        fromAccount: systemAccount._id,
        toAccount: targetAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING",
      });

      await transaction.save({ session });

      await ledgerModel.create(
        [
          {
            account: systemAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT",
          },
        ],
        { session },
      );

      await ledgerModel.create(
        [
          {
            account: targetAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT",
          },
        ],
        { session },
      );

      transaction.status = "COMPLETED";
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Faucet funds deposited successfully",
        amount,
        transaction,
      });
    } catch (innerErr) {
      await session.abortTransaction();
      session.endSession();
      throw innerErr;
    }
  } catch (error) {
    console.error("Faucet error:", error);
    return res.status(500).json({
      message: "Faucet operation failed",
      error: error.message,
    });
  }
}

async function updateAccountStatusController(req, res) {
  const { accountId } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "FROZEN", "CLOSED"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Must be ACTIVE, FROZEN, or CLOSED",
    });
  }

  try {
    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found or not owned by you",
      });
    }

    account.status = status;
    await account.save();

    return res.status(200).json({
      message: `Account status updated to ${status}`,
      account,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      message: "Failed to update account status",
      error: error.message,
    });
  }
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
  faucetController,
  updateAccountStatusController,
};