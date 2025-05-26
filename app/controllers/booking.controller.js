const db = require("../models/");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Facility = db.facility;
const Payment = db.payment;

exports.makeBooking = async (req, res) => {
    try {
        const { userId, roomId, checkInDate, checkOutDate, adults, children, specialRequests, totalPrice } = req.body;

        // ตรวจสอบช่วงเวลาซ้ำ
        const overlappingBooking = await Booking.findOne({
            where: {
                roomId,
                [Op.and]: [
                    { checkInDate: { [Op.lt]: checkOutDate } },
                    { checkOutDate: { [Op.gt]: checkInDate } },
                ],
            },
        });

        if (overlappingBooking) {
            return res.status(400).json({ error: 'Room is already booked during this period.' });
        }

        // ตรวจสอบห้อง
        const room = await Rooms.findOne({
            where: { id: roomId },
            include: [{ model: Type, as: 'type' }],
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found.' });
        }

        // สร้าง Booking
        const newBooking = await Booking.create({
            userId,
            roomId,
            checkInDate,
            checkOutDate,
            adults,
            children,
            specialRequests: specialRequests || '',
        });

        // สร้าง Payment
        const payment = await Payment.create({
            userId,
            bookingId: newBooking.id,
            amount: totalPrice,
            paymentStatus: 'pending',
            dueDate: dayjs.utc().add(24, 'hour').toDate(),
        });

        // ส่งข้อมูลกลับ
        res.status(200).json({
            message: 'Booking & Payment created successfully',
            bookingId: newBooking.id,
            paymentId: payment.id,
            paymentStatus: payment.paymentStatus,
            amount: payment.amount,
            dueDate: payment.dueDate,
            userId: payment.userId,
            roomInfo: room,
        });

    } catch (err) {
        console.error("Error in makeBooking:", err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};

