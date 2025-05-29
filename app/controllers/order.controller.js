const db = require("../models/");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");

const User = db.user;
const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Promotion = db.promotion;
const Payment = db.payment;
const Facility = db.facility;

exports.getOrderById = async (req,res) => {
    const id = req.params.id;
    
    try {
        const userDetail = await User.findByPk(id);
        if(!userDetail){
            return res.status(400).json({ message: "User not found"})
        }

        const bookingDetail = await Booking.findOne({
            where: { userId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: [
                        'id',
                        'firstname',
                        'lastname',
                        'email',
                    ]
                },
                {
                    model: Rooms,
                    as: 'room',
                    include: [
                        {
                            model: Type,
                            as: 'type',
                            attributes: [
                                'name',
                            ]
                        },
                        {
                            model: Promotion,
                            as: 'promotions',
                            attributes: [
                                'name',
                                'discount'
                            ]
                        }
                    ]
                },
                {
                    model: Payment,
                    as: 'payments',
                    attributes: ['bookingId', 'paymentStatus', 'amount'],

                }
            ]
        })
        if (!bookingDetail) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({
            booking: bookingDetail
        })
        
    } catch (error) {
        console.error("Error in getOrderById:", error);
        return res.status(500).json({ message: "Error fetching order details" });
        
    }
    
}

// controllers/bookingController.js

exports.getOrdersByUserId = async (req, res) => {
    const id = req.params.id;

    try {
        const userDetail = await User.findByPk(id, {
            where: { id: id }
        });

        if (!userDetail) {
            return res.status(404).json({ message: "User not found" });
        }

        const bookingList = await Booking.findAll({
            where: { userId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email']
                },
                {
                    model: Rooms,
                    as: 'room',
                    include: [
                        {
                            model: Type,
                            as: 'type',
                            attributes: ['name']
                        },
                        {
                            model: Promotion,
                            as: 'promotions', // ต้องตรงกับ alias ที่กำหนดไว้ใน belongsToMany
                            attributes: ['name', 'discount'],
                            through: { attributes: [] } // ซ่อนข้อมูลจาก table กลาง
                        },
                    ],
                    attributes: ['id', 'type_id', 'description','image_name']
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['paymentStatus', 'amount']
                }
            ],
            attributes: ['id', 'checkInDate', 'checkOutDate', 'adults', 'children'],
            order: [['createdAt', 'DESC']] // เรียงล่าสุดก่อน
        });

        return res.status(200).json({
            bookings: bookingList
        });

    } catch (error) {
        console.error("Error in getOrdersByUserId:", error);
        return res.status(500).json({ message: "Error fetching booking list" });
    }
};

exports.getPaymentsByUserId = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "กรุณาระบุ ID ผู้ใช้" });
  }

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstname', 'lastname', 'email']
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    // ดึง Payment ทั้งหมดของ user พร้อม Booking และรายละเอียดห้อง
    const payments = await Payment.findAll({
      where: { userId: userId },
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
                }
              ],
              attributes: ['id', 'type_id', 'description', 'price_per_night', 'image_name']
            }
          ],
          attributes: ['id', 'roomId', 'checkInDate', 'checkOutDate', 'specialRequests', 'checkedIn', 'checkedOut']
        }
      ],
      order: [['dueDate', 'DESC']]
    });
    // เพิ่ม bookedRoom ให้กับแต่ละ payment
const paymentsWithBookedRoom = payments.map(payment => {
  return {
    ...payment.toJSON(), // แปลง Sequelize instance เป็น plain object
    bookedRoom: payment.bookings?.length || 0
  };
});
    return res.status(200).json({
      user,
      payments: paymentsWithBookedRoom
    });

  } catch (error) {
    console.error("Error fetching payments by user:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงินของผู้ใช้" });
  }
};


