module.exports = (sequelize, Sequelize) => {
    const Type = sequelize.define("types", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
        },

        room_size: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        view: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        bed_type: {
            type: Sequelize.STRING,
            allowNull: false,
        },

    });
    return Type;
}