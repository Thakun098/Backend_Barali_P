const { authJwt } = require("../middleware");
const controller = require("../controllers/accommodation.controller");

module.exports = (app) => {
    app.get("/api/accommodation", [authJwt.verifyToken], controller.getAll);
    app.get("/api/accommodation/promotion", controller.getPromotion);
}