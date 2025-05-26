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


