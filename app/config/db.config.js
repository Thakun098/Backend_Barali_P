require("dotenv/config")
module.exports = {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT || 5432,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    DIALECT: process.env.DB_DIALECT || "postgres",
    pool: {
        max: parseInt(process.env.DB_POOL_MAX), //Connection พร้อมกันได้ 10 คนพร้อมกัน
        min: parseInt(process.env.DB_POOL_MIN), //Connection ขั้นตาม
        acquire: parseInt(process.env.DB_POOL_ACQUIRE), //เวลาที่รอได้ ms ถ้าหมดก็ Err
        idle: parseInt(process.env.DB_POOL_IDLE) //Idle ได้ไม่เกิน ms แล้วก็หลุด
    }
}