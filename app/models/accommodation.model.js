module.exports = (sequelize, Sequelize) => {
    const Room = sequelize.define("rooms", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'types',
                key: 'id'
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        max_adults: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        max_children: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        price_per_night: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        image_name: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    return Room;
}
