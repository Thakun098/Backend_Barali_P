const controller = require("../controllers/payment.controller");

module.exports = (app) => {
    app.put("/api/payment/update/:id", controller.updatePaymentStatus);
}