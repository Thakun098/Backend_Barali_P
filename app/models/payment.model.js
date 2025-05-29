const { payment } = require(".");

module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // ชื่อตาราง user ใน DB
            key: 'id'
        }
    },
    //     bookingId: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: 'bookings', // ชื่อตาราง booking ใน DB
    //         key: 'id'
    //     }
    // },
        paymentStatus: {
            type: Sequelize.ENUM('pending', 'paid', 'overdue', 'failed'),
            allowNull: true,
            defaultValue: 'pending'
        },
        paymentMethod: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        dueDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        paymentDate: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        },

    });
    return Payment;
}