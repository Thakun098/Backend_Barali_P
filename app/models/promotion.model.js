module.exports = (sequelize, Sequelize) => {
    const Promotion = sequelize.define("promotions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
        },

        discount: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true,
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },

    });
    return Promotion;
}