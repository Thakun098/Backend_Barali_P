const controller = require("../controllers/payment.controller");

module.exports = (app) => {
    app.put("/api/payment/update/:id", controller.updatePaymentStatus);
    app.get("/api/payment/:id", controller.getPaymentById);

    // Express mock route
    app.post('/api/payment/confirm/:id', (req, res) => {
    const { id } = req.params;
    // สมมุติอัปเดตสถานะใน DB
    res.json({ success: true, id, status: 'paid' });
});
}