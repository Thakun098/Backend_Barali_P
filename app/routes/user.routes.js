const controller = require("../controllers/user.controller");
const orderController = require("../controllers/order.controller");

module.exports = (app) => {
    app.get("/api/user/:userId", controller.getUserDetails);
    app.get("/api/user/status/booked", controller.getUserBooked);
    app.get("/api/user/withMore/threeBookings", controller.usersMoreThanThree);

    app.get("/api/user/order/:userId", orderController.getOrderById);
    app.get("/api/user/orders/all/:userId", orderController.getOrdersByUserId);

}