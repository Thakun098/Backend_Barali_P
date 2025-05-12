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
        accommodationId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        totalNights: {
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
        totalPrice: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        paymentStatus: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        paymentMethod: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        paymentDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        guestName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        guestEmail: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        guestPhone: {
            type: Sequelize.STRING,
            allowNull: false,
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
        isCancelled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        checkInNotes: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        checkOutNotes: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        checkOutRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        checkInTimestamp: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        checkOutTimestamp: {
            type: Sequelize.DATE,
            allowNull: true,
        },

    });
    return Booking;
}