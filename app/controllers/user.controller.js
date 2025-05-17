require("dotenv/config")
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

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
                            ]
                        },
                        {
                            model: Payment,
                            as: "payment",
                            attributes: ['paymentStatus', 'paymentMethod', 'paymentDate']
                        }
                    ]
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
