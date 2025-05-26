const db = require("../app/models");
const { Op } = require("sequelize");
const Payment = db.payment;

async function updateOverduePayments() {
  const now = new Date();

  await Payment.update(
    { paymentStatus: 'overdue' },
    {
      where: {
        paymentStatus: 'pending',
        dueDate: { [Op.lt]: now }
      }
    }
  );

  console.log(`[Cron] Updated overdue payments at ${now.toISOString()}`);
  console.log("[Cron] Current time (UTC):", new Date().toISOString());

}

module.exports = updateOverduePayments;
// 1. Update the paymentStatus to 'overdue' for pending payments with a dueDate in the past
// 2. Log a message to the console indicating the date and time when the update was performed