const db = require("../models/");
const { Op, where } = require("sequelize");

const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Facility = db.facility;
const Promotion = db.promotion;
const RoomPromotion = db.sequelize.models.room_promotions;

exports.calculatePromotion = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate } = req.query;
        if (!roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // Find the room by ID
        const room = await Rooms.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Calculate the number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = Math.abs(checkOut - checkIn);
        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Find applicable promotions for the room
        const promotions = await Promotion.findAll({
            include: [
                {
                    model: Rooms,
                    as: "rooms",
                    where: { id: roomId }
                }
            ],
            attributes: ["name", "discount"]
        });

        let totalPrice = room.price_per_night * numberOfNights;
        let discountAmount = 0;
        const originalPrice = totalPrice;

        if (promotions.length > 0) {
            promotions.forEach(promotion => {
                discountAmount += (totalPrice * promotion.discount) / 100;
            });
            totalPrice -= discountAmount;
        }

        return res.status(200).json({
            originalPrice,
            totalPrice,
            discountAmount,
            numberOfNights,
            promotions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error calculating promotion" });
    }
}