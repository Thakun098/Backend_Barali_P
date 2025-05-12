module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("activities", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
        },
        image_name: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    return Activity;
}