const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true
});

const outputPath = path.join(__dirname, '..', 'project_explanation.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors (Cool Dark Slate theme)
const primaryColor = '#1e293b';   // Dark Slate
const secondaryColor = '#4f46e5'; // Indigo Accent
const textColor = '#334155';      // Muted Charcoal
const lightBg = '#f8fafc';        // Off-white for code
const codeColor = '#0f172a';      // Very dark for code text
const headerColor = '#0f172a';    // Deepest black for headers

// Helper to draw header
function drawHeader(title) {
  doc.fillColor(secondaryColor).fontSize(10).text('BACKEND LEDGER & CONSOLE CONSOLE DOCUMENTATION', { align: 'right' });
  doc.moveDown(0.5);
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);
}

// Helper for footers
function drawFooter(pageNumber, totalPages) {
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 780).lineTo(545, 780).stroke();
  doc.fillColor('#64748b').fontSize(8).text(`Page ${pageNumber} of ${totalPages}`, 50, 788, { align: 'center' });
  doc.text('Confidential - Technical Documentation & User Manual', 50, 788, { align: 'left' });
}

// Cover Page
doc.rect(0, 0, 595, 842).fill('#0f172a'); // Indigo Dark Background for Cover Page

doc.fillColor('#ffffff')
   .fontSize(34)
   .font('Helvetica-Bold')
   .text('BACKEND LEDGER', 50, 240, { align: 'left' });

doc.fillColor('#818cf8')
   .fontSize(22)
   .font('Helvetica')
   .text('& CONSOLE DASHBOARD', 50, 285, { align: 'left' });

doc.rect(50, 325, 120, 4).fill('#4f46e5');

doc.fillColor('#94a3b8')
   .fontSize(12)
   .font('Helvetica-Oblique')
   .text('Full-Stack Double-Entry Ledger System with React Console UI', 50, 345);

doc.fillColor('#e2e8f0')
   .fontSize(10)
   .font('Helvetica')
   .text('Authored by:', 50, 580)
   .fillColor('#ffffff')
   .font('Helvetica-Bold')
   .text('Original Developer & Antigravity (Google Gemini Pair Programmer)', 50, 595)
   .fillColor('#94a3b8')
   .font('Helvetica')
   .text('Date: July 2026', 50, 615)
   .text('Version: 2.0 (Production-Ready Edition)', 50, 630);

// Add a page
doc.addPage();

// Table of Contents / Features List
drawHeader();
doc.fillColor(headerColor).font('Helvetica-Bold').fontSize(20).text('1. Project Feature Index', 50, 80);
doc.moveDown(1);

const features = [
  { name: 'Immutable Double-Entry Ledger', desc: 'All financial updates are driven by atomic CREDIT and DEBIT journal entries recorded in a ledger schema, ensuring mathematical consistency and prevents direct record updates or deletions.' },
  { name: 'Robust Authentication (JWT)', desc: 'Secure register and login mechanisms utilizing HTTP-only cookie-based JWT tokens, complemented by standard route protection.' },
  { name: 'Idempotency Protection', desc: 'Guarantees transaction execution safety. Re-submitting identical keys returns cached status results without creating duplicate ledger records.' },
  { name: 'React + Tailwind Dark Console', desc: 'A gorgeous dark gray dashboard featuring real-time account balances, create account shortcuts, money transfers, and visual audit histories.' },
  { name: 'Developer Faucet System', desc: 'Instant 10,000 INR test credit allocations directly from a self-provisioning System Faucet account for testing.' },
  { name: 'Account Lifecycle States', desc: 'Allows freezing, closing, or activating ledger accounts, enforcing business validation rules (frozen/closed accounts cannot engage in transfers).' },
  { name: 'Auditable Transaction History', desc: 'Comprehensive transaction lists indicating date, accounts, direction (Debit/Credit), and transaction state (Pending, Completed, Failed, Reversed).' }
];

features.forEach((f, idx) => {
  doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text(`${idx + 1}. ${f.name}`);
  doc.fillColor(textColor).font('Helvetica').fontSize(10).text(f.desc, { align: 'justify' });
  doc.moveDown(0.8);
});

// Section 2: Phase 1: Original Work Done by User
doc.addPage();
drawHeader();
doc.fillColor(headerColor).font('Helvetica-Bold').fontSize(18).text('2. Phase 1: Original Work Done by User', 50, 80);
doc.moveDown(0.8);

doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  'The initial foundation of the project was designed by the user as a robust Node.js + Express.js backend using Mongoose to interface with MongoDB. The schema design models double-entry ledger entries mapping credits and debits to financial transactions.',
  { align: 'justify' }
);
doc.moveDown(1.5);

const originalFiles = [
  { file: 'src/models/user.model.js', desc: 'Defines the User schema with name, email, and hashed password. Features a pre-save hook to hash passwords using bcryptjs and comparePassword methods.' },
  { file: 'src/models/account.model.js', desc: 'Represents bank/ledger accounts owned by users. Includes currency, status (ACTIVE, FROZEN, CLOSED) and an aggregate getBalance() helper method that calculates balance in real-time by subtracting DEBITs from CREDITs in the ledger.' },
  { file: 'src/models/transaction.model.js', desc: 'Captures transaction requests. Links to fromAccount and toAccount, has status (PENDING, COMPLETED, FAILED, REVERSED), amount, and a unique index for idempotencyKey.' },
  { file: 'src/models/Ledger.model.js', desc: 'The ledger model. Contains account link, amount, transaction link, and type (DEBIT or CREDIT). Ensures database immutability by blocking updates or deletes through Mongoose pre-hooks (updateOne, deleteOne, etc.).' },
  { file: 'src/config/db.js', desc: 'Handles connectivity with MongoDB Atlas using Mongoose and loads MONGO_URI from environment variables.' },
  { file: 'src/middlewares/auth.middleware.js', desc: 'Implements authenticating JWT tokens from cookies or Authorization headers, injecting user objects into requests. Restricts initial funds creation through systemUser middleware.' },
  { file: 'src/services/email.services.js', desc: 'Integrates Nodemailer using Google OAuth2 to send registration, transaction notification, and transaction failure emails.' }
];

originalFiles.forEach((f) => {
  doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text(f.file);
  doc.fillColor(textColor).font('Helvetica').fontSize(10).text(f.desc, { align: 'justify' });
  doc.moveDown(1);
});

// Section 3: Phase 2: Work Done by Antigravity
doc.addPage();
drawHeader();
doc.fillColor(headerColor).font('Helvetica-Bold').fontSize(18).text('3. Phase 2: Work Done by Antigravity', 50, 80);
doc.moveDown(0.8);

doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  'Antigravity solved several backend bugs, expanded backend features for production capability, and developed a premium React.js frontend interface.',
  { align: 'justify' }
);
doc.moveDown(1.2);

const agWork = [
  { title: 'Critical Bug Fix: Initial Funds Transaction Array Return', desc: 'In transaction.controller.js, createInitialFundsTransaction was using transactionModel.create() with an array input. Mongoose returns an array for this call, meaning transaction.status and transaction.save() threw errors and transaction._id was undefined. We replaced it with new transactionModel() and .save() to match createTransaction and maintain ledger consistency.' },
  { title: 'Implemented Get Transaction History API', desc: 'Developed GET /api/transactions which pulls all transactions associated with any of the user\'s ledger accounts. Supports account-specific filtering via query parameters, populated with fromAccount and toAccount fields (including owner details).' },
  { title: 'Implemented Developer Faucet Endpoint', desc: 'Created POST /api/accounts/:accountId/faucet. It automatically seeds 10,000 INR of test credits to a user\'s account. It handles automatic creation of the Faucet System User (system@ledger.com, systemUser: true) and its system account if not present in MongoDB.' },
  { title: 'Implemented Account Status Controller', desc: 'Added PATCH /api/accounts/:accountId/status to update accounts states (ACTIVE, FROZEN, CLOSED), allowing users to freeze and unfreeze accounts directly from the front-end console.' },
  { title: 'Session Management: Me & Logout APIs', desc: 'Added GET /api/auth/me to verify cookie persistence and POST /api/auth/logout to clear the session cookie.' },
  { title: 'CORS Configuration & Cookie Credentials', desc: 'Configured custom CORS headers in src/app.js allowing the React app (on port 5173) to send/receive cookies and session states safely.' },
  { title: 'React + Tailwind Dark Gray Console UI', desc: 'Engineered a modern single-page dashboard containing registration/login forms, real-time account balances, faucet shortcuts, transfer forms with auto-generated idempotency keys, and transaction history tables with Credit/Debit color codes.' }
];

agWork.forEach((w) => {
  doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text(w.title);
  doc.fillColor(textColor).font('Helvetica').fontSize(10).text(w.desc, { align: 'justify' });
  doc.moveDown(1);
});

// Section 4: User Manual
doc.addPage();
drawHeader();
doc.fillColor(headerColor).font('Helvetica-Bold').fontSize(18).text('4. User Manual & Verification Guide', 50, 80);
doc.moveDown(0.8);

doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  'Follow these instructions to run, verify, and demonstrate all system capabilities.',
  { align: 'justify' }
);
doc.moveDown(1.5);

doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text('4.1 Server Setup');
doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  '1. Install root backend dependencies:\n   $ npm install\n2. Start the Express backend (runs on port 3000):\n   $ npm run dev\n   The server will connect to MongoDB Atlas and verify connectivity.',
  { align: 'left' }
);
doc.moveDown(1.2);

doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text('4.2 Frontend Setup');
doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  '1. Navigate to the frontend directory:\n   $ cd frontend\n2. Install package requirements:\n   $ npm install\n3. Start the Vite React development server:\n   $ npm run dev\n   Open http://localhost:5173 inside your browser.',
  { align: 'left' }
);
doc.moveDown(1.2);

doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text('4.3 Step-by-Step Testing Flow');
doc.fillColor(textColor).font('Helvetica').fontSize(10).text(
  '1. Register a new user: Register an account. You will automatically be logged in.\n' +
  '2. Create accounts: Click "Create Account" twice. Copy the Account IDs to your clipboard.\n' +
  '3. Load funds: Click "+10k Faucet" on Account A. Its balance will update to 10,000.00 INR.\n' +
  '4. Transfer: In the Transfer Form, select Account A as Source. Paste Account B\'s ID as Recipient. Enter 3500.00. Click "Execute Transfer".\n' +
  '5. Review History: Account A\'s balance drops to 6,500. Account B climbs to 3,500. The transaction table records the details.\n' +
  '6. Freeze Check: Freeze Account A. Try to transfer 500 INR to Account B. It will fail with a message saying the source account must be active.',
  { align: 'justify' }
);

// Draw footer and page numbers
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  if (i > 0) { // Do not draw headers/footers on cover page
    drawFooter(i + 1, range.count);
  }
}

doc.end();

stream.on('finish', () => {
  console.log(`PDF successfully created at: ${outputPath}`);
});
