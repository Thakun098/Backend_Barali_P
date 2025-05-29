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
db.rooms = require("../models/accommodation.model")(sequelize, Sequelize);
db.activity = require("../models/activity.model")(sequelize, Sequelize);
db.booking = require("../models/booking.model")(sequelize, Sequelize);
db.payment = require("../models/payment.model")(sequelize, Sequelize);
db.facility = require("../models/facility.model")(sequelize, Sequelize);
db.promotion = require("../models/promotion.model")(sequelize, Sequelize);

//Relationship (Many to Many)
db.role.belongsToMany(db.user, {
    through: "user_roles"
});
db.user.belongsToMany(db.role, {
    through: "user_roles"
});
// Facility
db.rooms.belongsToMany(db.facility, {
    through: "room_facilities",
    as: "facilities",
    foreignKey: "roomId"
});
db.facility.belongsToMany(db.rooms, {
    through: "room_facilities",
    as: "rooms",
    foreignKey: "facilityId"
});

// Promotion
db.promotion.belongsToMany(db.rooms, {
    through: "room_promotions",
    as: "rooms",
    foreignKey: "promotionId"
});
db.rooms.belongsToMany(db.promotion, {
    through: "room_promotions",
    as: "promotions",
    foreignKey: "roomId"
});
// db.promotion.belongsToMany(db.type, {
//     through: "type_promotions",
//     as: "types",
//     foreignKey: "promotionId"
// });
// db.type.belongsToMany(db.promotion, {
//     through: "type_promotions",
//     as: "promotions",
//     foreignKey: "typeId"
// });

//Relationship (One to Many)
db.type.hasMany(db.rooms, {
    as: "rooms",
    foreignKey: "type_id",
    onDelete: "RESTRICT",
}); // หนึ่งประเภท มีหลายห้อง

db.rooms.belongsTo(db.type, {
    as: "type",
    foreignKey: "type_id",
}); // ห้องหนึ่งห้อง มีประเภทเดียว

db.user.hasMany(db.booking, {
    foreignKey: "userId",
    onDelete: "RESTRICT",
});

db.booking.belongsTo(db.user, {
    as: "user",
    foreignKey: "userId",
    onDelete: "RESTRICT",
});

db.rooms.hasMany(db.booking, {
    as: "bookings",
    foreignKey: "roomId",
    onDelete: "RESTRICT",
});

db.booking.belongsTo(db.rooms, {
    as: "room",
    foreignKey: "roomId",
});
db.user.hasMany(db.payment, {
    as: "payments",
    foreignKey: "userId",
    onDelete: "RESTRICT",
});
db.payment.belongsTo(db.user, {
    as: "user",
    foreignKey: "userId",
    onDelete: "RESTRICT",
});

// Payment hasMany Bookings
db.payment.hasMany(db.booking, {
  as: 'bookings',
  foreignKey: 'paymentId'
});

// Booking belongsTo Payment
db.booking.belongsTo(db.payment, {
  as: 'payment',
  foreignKey: 'paymentId'
});

// One to One relationship
// Payment Model
// db.payment.belongsTo(db.booking, {
//     as: 'bookings',
//     foreignKey: {
//         name: 'bookingId',
//         allowNull: false,
//         unique: true
//     },
//     onDelete: 'CASCADE'
// });

// // Booking Model
// db.booking.hasOne(db.payment, {
//     as: 'payments',
//     foreignKey: 'bookingId'
// });



module.exports = db;
