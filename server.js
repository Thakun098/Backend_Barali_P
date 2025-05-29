const express = require("express");
require("dotenv/config");
const cron = require("node-cron");
const app = express();
const db = require("./app/models");
const cors = require("cors");
const path = require("path");
const updateOverduePayments = require("./cron/updateOverduePayments");
const updateCheckedOut = require("./cron/updateCheckedOut");



app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// db.booking.sync({ alter: true })
//    .then( () => {
//         console.log("Table type Altered")

//     }
//     )
// db.booking.sync({ alter: true })
//     .then( () => {
//         console.log("Table booking Altered ✅")

//     }
//     )

// db.payment.sync({ alter: true })
//     .then( () => {
//         console.log("facilities booking Altered ✅")
//     }
//     )





// async function seedPromotions() {
//   try {
//     await db.sequelize.sync();  // เชื่อมต่อ DB และ sync models

//     await db.promotion.bulkCreate([
//       {
//         name: "Summer Escape",
//         discount: 62.00,
//         start_date: new Date("2025-06-01"),
//         end_date: new Date("2025-08-31"),
//       },
//       {
//         name: "Summer Deal",
//         discount: 60.00,
//         start_date: new Date("2025-06-01"),
//         end_date: new Date("2025-08-31"),
//       },
//       {
//         name: "Room with Breakfast",
//         discount: 0.00,
//         start_date: null,
//         end_date: null,
//       }
//     ]);

//     console.log("✅ Inserted mock promotion data successfully");

//   } catch (err) {
//     console.error("❌ Error inserting promotion data:", err);
//   } finally {
//     await db.sequelize.close();
//   }
// }

// seedPromotions();

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("✅ Database Sync...")
    })

// Schedule the cron job to run every day at midnight
cron.schedule("*/2 * * * *", () => {
  updateOverduePayments();
    // updateCheckedOut();
});

app.get('/', (req, res) => {
    res.send('Hello Elyia');
    // console.log("Hello Elysia");
});



require("./app/routes/auth.routes")(app);
require("./app/routes/accommodation.routes")(app);
require("./app/routes/activity.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/caltest.routes")(app);
require("./app/routes/booking.routes")(app);
require("./app/routes/payment.routes")(app);

const port = process.env.SERVER_PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} `)
});



