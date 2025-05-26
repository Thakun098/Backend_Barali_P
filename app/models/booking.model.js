module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("bookings", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        roomId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        checkInDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        checkOutDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        adults: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        children: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        specialRequests: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        checkedIn: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        checkedOut: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        checkOutRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
        }

    });
    return Booking;
}