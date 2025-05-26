const controller = require("../controllers/booking.controller");

module.exports = (app) => {
    app.post("/api/booking/make", controller.makeBooking);
};