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
        const { roomId, checkInDate, checkOutDate } = req.query;
        const adults = parseInt(req.query.adults) || 1;
        const children = parseInt(req.query.children) || 0;
        

        if (!roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const room = await Rooms.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = Math.abs(checkOut - checkIn);
        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

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



        let extraBedAmount = 0;
        //กรณีผู้ใหญ่ไม่เกินสอง และไม่มีเด็ก 
        if (adults > 2 && children === 0) {
            // คิดเฉพาะเตียงเสริมถ้ามีผู้ใหญ่เกิน 2
            extraBedAmount = 0;
            totalPrice += extraBedAmount;
        }
        //กรณีผู้ใหญ่ไม่เกินสอง และเด็ก 1 คน คิดค่าเด็กเพิ่มอย่างเดียว
        if (adults <= 2 && children === 1) {
            extraBedAmount = extraBedForChildren * numberOfNights;
            totalPrice += extraBedAmount;
        }
        //กรณีผู้ใหญ่เกินสอง และเด็ก 1 คน คิดค่าเด็กเพิ่มพร้อมผู้ใหญ่อีก 1 คน
        if (adults > 2 && children === 1) {
            extraBedAmount = (extraBedForChildren * numberOfNights) + (extraBedForAdult * numberOfNights);
            totalPrice += extraBedAmount;
        }
        //กรณีที่มีแค่ผู้ใหญ่ที่เกิน 2 คนต่อห้อง คิดค่าผู้ใหญ่เพิ่ม 1 คน
        if(adults > 2){
            extraBedAmount = extraBedForAdult * numberOfNights;
            totalPrice += extraBedAmount;
        }
        //กรณีที่ ผู้ใหญ่ 1 คน แต่เด็กเกิน 2 คน คิดค่าเด็กเพิ่ม 1 คน
        if(adults < 2 && children > 2){
            extraBedAmount = extraBedForChildren * numberOfNights;
            totalPrice += extraBedAmount;
        }

        return res.status(200).json({
            originalPrice,
            discountAmount,
            adults,
            children,
            extraBedAmount,
            totalPrice,
            numberOfNights,
            promotions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error calculating promotion" });
    }
}
