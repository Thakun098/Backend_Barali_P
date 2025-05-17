const express = require("express");
require("dotenv/config");
const app = express();
const db = require("./app/models");
const cors = require("cors");
const path = require("path")


app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// db.type.sync({ alter: true })
//    .then( () => {
//         console.log("Table type Altered")

//     }
//     )
// db.payment.sync({ alter: true })
//     .then( () => {
//         console.log("Table payment Altered ✅")

//     }
//     )

// db.facility.sync({ alter: true })
//     .then( () => {
//         console.log("facilities booking Altered ✅")
//     }
//     )





// async function seedRooms() {
//   try {
//     await db.facility.bulkCreate([
//   { name: "อาหารเช้า" },
//   { name: "ไดร์เป่าผม" },
//   { name: "ที่จอดรถ" },
//   { name: "ฟรี WIFI" },
//   { name: "ตู้เย็น" },
//   { name: "รองเท้าแตะ" },
//   { name: "โต๊ะทำงาน" },
//   { name: "กระดาษชำระ" },
//   { name: "ร่ม" }
// ]);
//     console.log("✅ Inserted mock room data successfully");
//   } catch (err) {
//     console.error("❌ Error inserting room data:", err);
//   }
// }

// seedRooms();

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("Database Sync...")
    })

app.get('/', (req, res) => {
    res.send('Hello Elyia');
    // console.log("Hello Elysia");
});



require("./app/routes/auth.routes")(app);
require("./app/routes/accommodation.routes")(app);
require("./app/routes/activity.routes")(app);
require("./app/routes/user.routes")(app);

const port = process.env.SERVER_PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} `)
});



