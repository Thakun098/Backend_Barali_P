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
// db.accommodation.sync({ alter: true })
//     .then( () => {
//         console.log("Table accommodation Altered")

//     }
//     )

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

const port = process.env.SERVER_PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} `)
});
