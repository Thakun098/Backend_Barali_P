const db = require("../app/models");
const { Op } = require("sequelize");
const Booking = db.booking;

async function updateCheckedOut() {
  const now = new Date();

  await Booking.update(
    { checkedOut: true},
    {
      where: {
        checkedOut: false,
        checkOutDate: { [Op.lt]: now }
      }
    }
  );

  console.log(`[Cron] Updated checkedOut at ${now.toISOString()}`);
  console.log("[Cron] Current time (UTC):", new Date().toISOString());

}

module.exports = updateCheckedOut;
// 1. Update the paymentStatus to 'overdue' for pending payments with a dueDate in the past
// 2. Log a message to the console indicating the date and time when the update was performed