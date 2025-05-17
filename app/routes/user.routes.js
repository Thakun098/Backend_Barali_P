const controller = require("../controllers/user.controller");

module.exports = (app) => {
    app.get("/api.user/:userId", controller.getUserDetails);

}