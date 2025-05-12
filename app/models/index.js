const config = require("../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        port: config.PORT,
        dialect: config.DIALECT,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = require("../models/ีuser.model")(sequelize, Sequelize);
db.role = require("../models/role.model")(sequelize, Sequelize);
db.type = require("../models/type.model")(sequelize, Sequelize);
db.accommodation = require("../models/accommodation.model")(sequelize, Sequelize);
db.activity = require("../models/activity.model")(sequelize, Sequelize);
db.booking = require("../models/booking.model")(sequelize, Sequelize);

//Relationship (Many to Many)
db.role.belongsToMany(db.user, {
    through: "user_roles"
});
db.user.belongsToMany(db.role, {
    through: "user_roles"
});

//Relationship (One to Many)
db.type.hasMany(db.accommodation, {

    foreignKey: "type_id",
    onDelete: "RESTRICT", 
}
); //หนึ่งประเภท มีหลายห้อง
db.accommodation.belongsTo(db.type, {

    foreignKey: "type_id"
}
); //ห้องหนึ่งห้อง มีประเภทเดียว
db.user.hasMany(db.booking, {
    foreignKey: "userId",
    onDelete: "RESTRICT"
});
db.accommodation.hasMany(db.booking, {
    foreignKey: "accommodationId",
    onDelete: "RESTRICT"
});


module.exports = db;
