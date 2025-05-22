const controller = require("../controllers/user.controller");

module.exports = (app) => {
    app.get("/api/user/:userId", controller.getUserDetails);
    app.get("/api/user/status/booked", controller.getUserBooked);
    app.get("/api/user/withMore/threeBookings", controller.usersMoreThanThree);

}