module.exports = (sequelize, Sequelize) => {
    const Facility = sequelize.define("facilities", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
        },
        icon_name: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    return Facility;
}