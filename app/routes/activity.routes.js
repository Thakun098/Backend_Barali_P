const controller = require("../controllers/activity.controller");
// const { authJwt } = require("../middleware");

module.exports = (app) => {
    // [authJwt.verifyToken]
    app.get("/api/activity", controller.getAll);
}