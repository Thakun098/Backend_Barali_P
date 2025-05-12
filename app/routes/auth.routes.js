const controller = require("../controllers/auth.controller");

module.exports = (app) => {
    //app.get("/api/signup", controller.signup); //ส่งข้อมูลได้ แต่เห็นที่ URL ไม่ Secure
    app.post("/api/auth/signin", controller.signin); //ส่งข้อมูลได้ แต่เห็นที่ URL ไม่ Secure

}