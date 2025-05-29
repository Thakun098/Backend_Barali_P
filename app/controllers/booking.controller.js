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
        const { userId, roomIds, checkInDate, checkOutDate, adults, children, specialRequests, totalPrice } = req.body;

        if (!Array.isArray(roomIds) || roomIds.length === 0) {
            return res.status(400).json({ error: 'roomIds ต้องเป็น array และไม่ว่าง' });
        }
        if (roomIds.length > 9) {
            return res.status(400).json({ error: 'ไม่สามารถจองห้องพักเกิน 9 ห้องได้ในครั้งเดียว' });
        }


        // ตรวจสอบห้องว่างทีละห้อง
        for (const roomId of roomIds) {
            const overlappingBooking = await Booking.findOne({
                where: {
                    roomId,
                    [Op.and]: [
                        { checkInDate: { [Op.lt]: checkOutDate } },
                        { checkOutDate: { [Op.gt]: checkInDate } },
                    ],
                },
                include: [
                    {
                        model: Payment,
                        as: 'payment',
                        required: true,
                        where: {
                            [Op.or]: [
                                { paymentStatus: 'paid' },
                                {
                                    paymentStatus: 'pending',
                                    dueDate: { [Op.gt]: new Date() }  // ยังไม่หมดอายุ
                                }
                            ]
                        }
                    }
                ]
            });

            if (overlappingBooking) {
                return res.status(400).json({ error: `Room ID ${roomId} is already booked during this period.` });
            }
        }

        // สร้าง payment เดียว
        const payment = await Payment.create({
            userId,
            amount: totalPrice,
            paymentStatus: 'pending',
            dueDate: dayjs.utc().add(24, 'hour').toDate(),
        });

        // สร้าง bookings หลายรายการ
        const bookings = [];
        for (const roomId of roomIds) {
            const newBooking = await Booking.create({
                userId,
                roomId,
                paymentId: payment.id,
                checkInDate,
                checkOutDate,
                adults,
                children,
                specialRequests: specialRequests || '',
            });
            bookings.push(newBooking);
        }

        res.status(200).json({
            message: 'Bookings & Payment created successfully',
            paymentId: payment.id,
            bookingIds: bookings.map(b => b.id),
            paymentStatus: payment.paymentStatus,
            amount: payment.amount,
            dueDate: payment.dueDate,
            userId: payment.userId,
        });

    } catch (err) {
        console.error("Error in makeBooking:", err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};


