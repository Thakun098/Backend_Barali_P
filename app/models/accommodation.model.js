module.exports = (sequelize, Sequelize) => {
    const Accommodation = sequelize.define("accommodations", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        capacity: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        price_per_night: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        discount: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        amenities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        total_rooms: {
            type: Sequelize.INTEGER,
            allowNull: false,
            
        },
        room_size: {
            type: Sequelize.INTEGER,
            allowNull: true,
            
        },
        room_view: {
            type: Sequelize.STRING,
            allowNull: true
        },
        bed_type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        image_name: {
            type: Sequelize.STRING,
            allowNull: true
        }

    });
    return Accommodation;
}