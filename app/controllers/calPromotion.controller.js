const db = require("../models/");
const { Op, where } = require("sequelize");

const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Facility = db.facility;
const Promotion = db.promotion;
const RoomPromotion = db.sequelize.models.room_promotions;

const extraBedForAdult = 1000;
const extraBedForChildren = 749;

exports.calculatePromotion = async (req, res) => {
    try {
        const {checkInDate, checkOutDate } = req.query;
        const roomId = parseInt(req.query.roomId);
        const adults = parseInt(req.query.adults) || 1;
        const children = parseInt(req.query.children) || 0;

if (isNaN(roomId) || roomId <= 0) {
    return res.status(400).json({ message: "Invalid room ID" });
}

        if (!roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Missing required parameters" });
        }
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
    return res.status(400).json({ message: "Invalid check-in/check-out dates" });
}

        //  ไม่รองรับกรณีผู้ใหญ่ 2 เด็ก 2
        if (adults === 2 && children === 2) {
            return res.status(400).json({
                message: "ไม่รองรับกรณีผู้ใหญ่ 2 คน เด็ก 2 คน กรุณาปรับจำนวนผู้เข้าพัก"
            });
        }

        const room = await db.rooms.findByPk(roomId, {
            include: [
                {
                    model: Type,
                    as: 'type'  // ต้องตรงกับ association ที่ตั้งไว้ใน model
                }
            ]
        });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        if (!room.price_per_night) {
    return res.status(400).json({ message: "Room price is not defined." });
}

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const numberOfNights = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 3600 * 24));

        //  คิดส่วนลดจากผู้ใหญ่ 2 คนแรกเท่านั้น
        const basePricePerNight = room.price_per_night;
        const priceWithoutDiscount = basePricePerNight * numberOfNights;

        const promotions = await db.promotion.findAll({
            include: [{ model: db.rooms, as: "rooms", where: { id: roomId } }],
            attributes: ["name", "discount"]
        });

        let discountPercent = promotions.reduce((sum, promo) => sum + promo.discount, 0);
        let discountedPrice = priceWithoutDiscount;

        if (discountPercent > 0) {
            // คิดเฉพาะสำหรับผู้ใหญ่ 2 คนแรกเท่านั้น
            const eligiblePrice = basePricePerNight * numberOfNights;
            discountedPrice = eligiblePrice - (eligiblePrice * discountPercent / 100);
        }

        //  คำนวณ Extra Charge
        let extraAdultCount = Math.max(0, adults - 2);
        let extraChildren = 0;

        if (adults === 1 && children > 2) {
            extraChildren = children - 2;
        } else if (adults >= 2 && children >= 1) {
            extraChildren = Math.max(0, children - 1);
        }

        // กรณีผู้ใหญ่ >= 2 และเด็ก 1 คน → ต้องคิด 749
        if (adults >= 2 && children === 1) {
            extraChildren = 1;
        }

        const extraAdultCost = extraAdultCount * extraBedForAdult * numberOfNights;
        const extraChildrenCost = extraChildren * extraBedForChildren * numberOfNights;

        const totalPrice = discountedPrice + extraAdultCost + extraChildrenCost;

        return res.status(200).json({
            roomInfo: room,
            originalPrice: priceWithoutDiscount,
            discountAmount: priceWithoutDiscount - discountedPrice,
            adults,
            children,
            extraAdultCount,
            extraChildren,
            extraBedAmount: extraAdultCost + extraChildrenCost,
            totalPrice,
            numberOfNights,
            promotions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error calculating promotion" });
    }
}