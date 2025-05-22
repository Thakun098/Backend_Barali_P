const { authJwt } = require("../middleware");
const controller = require("../controllers/accommodation.controller");

module.exports = (app) => {
    app.get("/api/accommodation/search", controller.getSearch);
    app.get("/api/accommodation/popular", controller.getPopularRoom);
    app.get("/api/accommodation", controller.getAll);
    app.get("/api/accommodation/promotion", controller.getPromotion);
    app.get("/api/accommodation/available", controller.getAvailableRooms);
    app.get("/api/accommodation/roomCount", controller.getRoomCountByType);
    app.get("/api/accommodation/type", controller.getAllTypes);

    
    
}