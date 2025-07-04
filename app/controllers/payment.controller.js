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
const User = db.user;
const Promotion = db.promotion;
const Receipt = db.receipt;

exports.updatePaymentStatus = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "กรุณาระบุ ID การชำระเงิน" });
    }

    try {
        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({ message: "ไม่พบข้อมูลการชำระเงิน" });
        }
        if (payment.paymentStatus === 'paid') {
            return res.status(400).json({ message: "ชำระเงินไปแล้ว" });
        }

        payment.paymentStatus = 'paid';
        payment.paymentDate = new Date();
        await payment.save();

        res.status(200).json({ message: "ชำระเงินสำเร็จ", payment });

    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ message: "Error updating payment status" });
    }
}

exports.getPaymentById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "กรุณาระบุ ID การชำระเงิน" });
    }

    try {
        const payment = await Payment.findByPk(id, {
            include: [
                {
                    model: Booking,
                    as: 'bookings',
                    include: [
                        {
                            model: Rooms,
                            as: 'room',
                            include: [
                                {
                                    model: Type,
                                    as: 'type',
                                    attributes: ['id', 'name', 'room_size', 'view', 'bed_type']
                                },
                                {
                                    model: Facility,
                                    as: 'facilities',
                                    attributes: ['id', 'name', 'icon_name'],
                                    through: { attributes: [] }
                                },
                                {
                                    model: Promotion,
                                    as: 'promotions',
                                    attributes: ['id', 'name', 'discount'],
                                    through: { attributes: [] }
                                },

                            ],
                            attributes: ['id', 'type_id', 'description', 'price_per_night', 'image_name']
                        },

                    ],
                    attributes: ['id', 'userId', 'roomId', 'checkInDate', 'checkOutDate', 'specialRequests', 'checkedIn', 'checkedOut', 'paymentId', 'adults', 'children']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email', 'phone']
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({ message: "ไม่พบข้อมูลการชำระเงิน" });
        }
        


        // ส่งกลับในรูปแบบที่ frontend ใช้งานได้ง่าย
        res.status(200).json({
            id: payment.id,
            checkIn: payment.bookings[0]?.checkInDate,
            checkOut: payment.bookings[0]?.checkOutDate,
            adults: payment.bookings[0]?.adults,
            children: payment.bookings[0]?.children,
            paymentStatus: payment.paymentStatus,
            totalPrice: payment.amount,
            dueDate: payment.dueDate,
            userId: payment.userId,
            user: payment.user,
            roomIds: payment.bookings?.map(b => b.id),
            promotions: payment.bookings?.map(b => b.room.promotions),
            roomType: payment.bookings?.map(b => b.room.type),
        });
    } catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน" });
    }
};

exports.getReceiptById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "กรุณาระบุ ID การชำระเงิน" });
    }

    try {
        // ดึงข้อมูลจาก receipt table
        const receipt = await Receipt.findOne({ where: { paymentId: id } });

        if (!receipt) {
            return res.status(404).json({ message: "ไม่พบข้อมูลใบเสร็จสำหรับการชำระเงินนี้" });
        }

        res.status(200).json({
            id: receipt.paymentId,
            checkIn: receipt.checkIn,
            checkOut: receipt.checkOut,
            adults: receipt.adults,
            children: receipt.children,
            paymentStatus: receipt.paymentStatus,
            totalPrice: receipt.totalPrice,
            dueDate: receipt.dueDate,
            userId: receipt.userId,
            roomIds: receipt.roomIds,
            promotions: receipt.promotions,
            roomType: receipt.roomType,
        });
    } catch (error) {
        console.error("Error fetching receipt:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ" });
    }
};


