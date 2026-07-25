const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/Ledger.model");
const accountModel = require("../models/account.model");
const emailServices = require("../services/email.services");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount and idempotencyKey are required",
    });
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be a positive number",
    });
  }
  if (fromAccount === toAccount) {
    return res.status(400).json({
      message: "Sender and receiver accounts cannot be the same.",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
    user: req.user._id,
  });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid/forbidden fromAccount or toAccount",
    });
  }

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is processing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(200).json({
        message: "Transaction already reversed, please retry",
      });
    }
  }

  const fromStatus = fromUserAccount.status || "ACTIVE";
  const toStatus = toUserAccount.status || "ACTIVE";

  if (fromStatus !== "ACTIVE" || toStatus !== "ACTIVE") {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to process transaction",
    });
  }

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: "Insufficient balance in fromAccount",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = new transactionModel({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await transaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
      },],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    if (req.user?.email && req.user?.name) {
      await emailServices.sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        toAccount,
      );
    }

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    return res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount  || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount and idempotencyKey are required",
    });
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be a positive number",
    });
  }

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({ user: req.user?._id });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await transaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
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
          account: toAccount,
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

    return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Initial funds transaction failed:", error);
    return res.status(500).json({
      message: "Initial funds transaction failed",
      error: error.message,
    });
  }
}

async function getTransactionHistory(req, res) {
  try {
    const { accountId } = req.query;
    let query = {};

    const userAccounts = await accountModel.find({ user: req.user._id });
    const userAccountIds = userAccounts.map((acc) => acc._id.toString());

    if (accountId) {
      if (!userAccountIds.includes(accountId)) {
        return res.status(403).json({
          message: "Forbidden: You do not own this account",
        });
      }
      query = {
        $or: [{ fromAccount: accountId }, { toAccount: accountId }],
      };
    } else {
      query = {
        $or: [
          { fromAccount: { $in: userAccountIds } },
          { toAccount: { $in: userAccountIds } },
        ],
      };
    }

    const transactions = await transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "fromAccount",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "toAccount",
        populate: { path: "user", select: "name email" },
      });

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get transaction history failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve transaction history",
      error: error.message,
    });
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
  getTransactionHistory,
};

