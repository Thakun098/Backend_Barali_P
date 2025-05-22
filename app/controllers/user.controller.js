require("dotenv/config")
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const Sequelize = require("sequelize");

const User = db.user;
const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Payment = db.payment;

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({
            where: { id: userId },
            attributes: ["id", "firstname", "lastname", "email", "phone"],
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    include: [
                        {
                            model: Rooms,
                            as: "room",
                            include: [
                                {
                                    model: Type,
                                    as: "type",
                                    attributes: ["name"]
                                }
                            ],
                            attributes: ["id", "price_per_night", "description", "image_name"]
                            
                        },
                        {
                            model: Payment,
                            as: "payment",
                            attributes: ['paymentStatus', 'paymentMethod', 'paymentDate']
                        }
                    ],
                    attributes: ["id", "checkInDate", "checkOutDate"],

                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user details" });
    }
};

exports.getUserBooked = async (req, res) => {
    try {
        const usersWithBookings = await User.findAll({
            attributes: ["id", "firstname", "lastname", "email", "phone"],
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    required: true, // ดึงเฉพาะผู้ใช้ที่มีการจอง
                    attributes: ["id", "checkInDate", "checkOutDate", "createdAt"],

                },
                {
                    model: Payment,
                    as: "payments",
                    attributes: ["paymentStatus", "paymentMethod", "paymentDate"]
                }

            ],
            order: [["id", "ASC"]]
        });

        return res.status(200).json(usersWithBookings);

    } catch (error) {
        console.error("Error in getUserBooked:", error);
        res.status(500).json({ message: "Error fetching booked users" });
    }
};

exports.usersMoreThanThree = async (req, res) => {
    try {
        const usersWithBookings = await User.findAll({
            attributes: [
                'id',
                'firstname',
                'lastname',
                [Sequelize.fn('COUNT', Sequelize.col('bookings.id')), 'bookingCount']
            ],
            include: [{
                model: Booking,
                as: 'bookings', // ต้องตรงกับ alias ที่กำหนดไว้ใน association
                attributes: []
            }],
            group: ['users.id'],
            having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('bookings.id')), {
                [Op.gt]: 3 // เงื่อนไขมากกว่า 3
            }),
        });

        return res.status(200).json(usersWithBookings);

    } catch (error) {
        console.error("Error in usersMoreThanThree:", error);
        return res.status(500).json({ message: "Error fetching users with more than 3 bookings" });
    }
};


