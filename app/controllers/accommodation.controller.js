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
const Promotion = db.promotion;
const Payment = db.payment;

exports.getAll = async (req, res) => {
    try {
        const room = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name", "room_size", "view", "bed_type"],

                },
                {
                    model: Facility,
                    as: "facilities",
                    attributes: ["name"],
                    through: {
                        attributes: [] // Exclude the join table attributes
                    }
                }
            ],
        });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Rooms" });
    }
};

exports.getPromotion = async (req, res) => {
    // const checkIn = dayjs().add(1, 'day').format('YYYY-MM-DD');
    // const checkOut = dayjs().add(10, 'day').format('YYYY-MM-DD'); 
    const now = dayjs().format('YYYY-MM-DD');
    try {
        const promotion = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name", "room_size", "view", "bed_type"],
                },
                {
                    model: Promotion,
                    as: "promotions",
                    required: true, //  ให้ return เฉพาะที่ JOIN แล้วมี promotion
                    through: { attributes: [] }, // ซ่อนข้อมูลในตาราง join
                    attributes: ["name", "discount"]
                },
                {
                    model: Facility,
                    as: "facilities",
                    attributes: ["name"],
                    through: {
                        attributes: [] // Exclude the join table attributes
                    }
                },
            ]
        });
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Promotions" });
    }
};

exports.getPopularRoom = async (req, res) => {
    try {
        const limitNum = 4;
        const minRatingNum = 4;

        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name", "room_size", "view", "bed_type"],

                },
                {
                    model: Booking,
                    as: "bookings",
                },
                {
                    model: Promotion,
                    as: "promotions",
                    through: { attributes: [] },
                },
                {
                    model: Facility,
                    as: "facilities",
                    attributes: ["name"],
                    through: {
                        attributes: [] // Exclude the join table attributes
                    }
                }

            ],
        });
        // res.send(rooms)
            const popularRooms = rooms.map(room => {
            const roomData = room.toJSON();
            const bookings = roomData.bookings || [];

            const validRatings = bookings
                .map(b => b.checkOutRating)
                .filter(r => typeof r === 'number');

            const averageRating = validRatings.length > 0
                ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
                : 0;

            const ratingPercentage = (averageRating / 5) * 100;

            const now = new Date();
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);

            const recentBookings = bookings.filter(b => {
                const bookingDate = new Date(b.checkInDate);
                return bookingDate >= thirtyDaysAgo && bookingDate <= now;
            });

            const popularityScore = (averageRating * 0.5) + (recentBookings.length * 0.5);

            return {
                ...roomData,
                averageRating: parseFloat(averageRating.toFixed(2)),
                ratingPercentage: parseFloat(ratingPercentage.toFixed(2)),
                countRating: validRatings.length,
                countBooking: recentBookings.length,
                popularityScore: parseFloat(popularityScore.toFixed(2))
            };
        });

        const filteredRooms = popularRooms
            .filter(r => r.averageRating >= minRatingNum)
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, limitNum);

        res.status(200).json(filteredRooms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching popular rooms" + error });
    }
};


exports.getSearch = async (req, res) => {
    try {
        const { checkIn, checkOut, adults = 1, children = 0, selectedTypes = "" } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "Please provide checkIn and checkOut dates." });
        }

        const now = new Date().toISOString();

        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name"],
                    where: selectedTypes ? {
                        name: { [Op.like]: `%${selectedTypes}%` }
                    } : undefined,
                },
                {
                    model: Promotion,
                    as: "promotions",
                    attributes: ["id", "name", "discount"],
                    through: { attributes: [] },
                },
                {
                    model: Facility,
                    as: "facilities",
                    attributes: ["name", "icon_name"],
                    through: { attributes: [] },
                }
            ],
            where: {
                [Op.and]: [
                    { max_adults: { [Op.gte]: adults } },
                    { max_children: { [Op.gte]: children } },
                    // Use NOT EXISTS logic to exclude overlapping bookings
                    Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1 FROM "bookings" AS b
                            INNER JOIN "payments" AS p ON b."paymentId" = p."id"
                            WHERE b."roomId" = "rooms"."id"
                              AND b."checkedOut" = false
                              AND (
                                  b."checkInDate" BETWEEN '${checkIn}' AND '${checkOut}'
                                  OR b."checkOutDate" BETWEEN '${checkIn}' AND '${checkOut}'
                                  OR (b."checkInDate" <= '${checkIn}' AND b."checkOutDate" >= '${checkOut}')
                              )
                              AND (
                                  p."paymentStatus" = 'paid'
                                  OR (
                                      p."paymentStatus" = 'pending'
                                      AND p."dueDate" IS NOT NULL
                                      AND p."dueDate" > '${now}'
                                  )
                              )
                        )
                    `)
                ]
            },
            order: [['id', 'ASC']]
        });

        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getRoomCountByType = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "Please provide checkIn and checkOut dates" });
        }

        const now = new Date();

        const types = await Type.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Rooms,
                    as: "rooms",
                    attributes: ['id'],
                    include: [
                        {
                            model: Booking,
                            as: "bookings",
                            required: false,
                            where: {
                                checkedOut: false,
                                checkInDate: { [Op.lt]: checkOut },
                                checkOutDate: { [Op.gt]: checkIn },
                            },
                            include: [
                                {
                                    model: Payment,
                                    as: "payment",
                                    required: true,
                                    where: {
                                        [Op.or]: [
                                            { paymentStatus: 'paid' },
                                            {
                                                paymentStatus: 'pending',
                                                dueDate: {
                                                    [Op.and]: [
                                                        { [Op.ne]: null },
                                                        { [Op.gt]: now }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']]
        });

        const results = types.map(type => {
            const rooms = type.rooms || [];

            const bookedRoomId = rooms
                .filter(room => (room.bookings || []).length > 0)
                .map(room => room.id);

            return {
                typeId: type.id,
                typeName: type.name,
                totalRooms: rooms.length,
                availableRooms: rooms.length - bookedRoomId.length,
                bookedRoomId,
                bookedRoomCount: bookedRoomId.length,
            };
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error in getRoomCountByType:", error);
        res.status(500).json({ message: "Error fetching room counts by type" });
    }
};


exports.getAvailableRooms = async (req, res) => {
    const { formattedCheckIn, formattedCheckOut } = req.query;

    if (!formattedCheckIn || !formattedCheckOut) {
        return res.status(400).json({ message: "Please provide checkIn and checkOut dates" });
    }

    try {
        const now = new Date();

        // ดึงห้องทั้งหมด พร้อมประเภท และการจองที่อาจทับวัน
        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    required: false,
                    where: {
                        checkedOut: false,
                        [Op.or]: [
                            { checkInDate: { [Op.between]: [formattedCheckIn, formattedCheckOut] } },
                            { checkOutDate: { [Op.between]: [formattedCheckIn, formattedCheckOut] } },
                            {
                                checkInDate: { [Op.lte]: formattedCheckIn },
                                checkOutDate: { [Op.gte]: formattedCheckOut }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Payment,
                            as: "payment",
                            required: true,
                            where: {
                                [Op.or]: [
                                    { paymentStatus: 'paid' },
                                    {
                                        paymentStatus: 'pending',
                                        dueDate: { [Op.gt]: now }
                                    }
                                ]
                            }
                        }
                    ],
                    attributes: ["id"]
                },
                {
                    model: Type,
                    as: "type",
                    attributes: ["id", "name"]
                }
            ]
        });

        // เตรียม object สำหรับเก็บข้อมูลประเภท
        const roomTypeMap = {};

        rooms.forEach(room => {
            const typeId = room.type?.id;
            const typeName = room.type?.name || "Unknown";

            if (!roomTypeMap[typeId]) {
                roomTypeMap[typeId] = {
                    typeId,
                    typeName,
                    totalRooms: 0,
                    bookedRoomId: [],
                    bookedRoomCount: 0,
                    availableRooms: 0
                };
            }

            // บวกจำนวนห้องทั้งหมดของประเภทนี้
            roomTypeMap[typeId].totalRooms += 1;

            // ถ้าห้องนี้ถูกจองในช่วงวันนั้น และมี payment ที่ผ่านเงื่อนไข
            if (room.bookings.length > 0) {
                roomTypeMap[typeId].bookedRoomId.push(room.id);
                roomTypeMap[typeId].bookedRoomCount += 1;
            } else {
                roomTypeMap[typeId].availableRooms += 1;
            }
        });

        // แปลงจาก object เป็น array เพื่อส่งกลับ
        const result = Object.values(roomTypeMap);

        return res.status(200).json({ availableByType: result });

    } catch (error) {
        console.error("Error checking available rooms:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAvailableRoomsWithPromotion = async (req, res) => {
    try {
        // Use params if provided, otherwise fallback to tomorrow and the day after tomorrow
        let { checkIn, checkOut } = req.query;
        if (!checkIn || !checkOut) {
            checkIn = dayjs().add(1, 'day').format('YYYY-MM-DD');
            checkOut = dayjs().add(2, 'day').format('YYYY-MM-DD');
        }
        const now = new Date().toISOString();

        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Promotion,
                    as: "promotions",
                    required: true,
                    attributes: ["id", "name", "discount"],
                    through: { attributes: [] },
                },
                {
                    model: Type,
                    as: "type",
                    attributes: ["name", "room_size", "view", "bed_type"],
                },
                {
                    model: Facility,
                    as: "facilities",
                    attributes: ["name", "icon_name"],
                    through: { attributes: [] },
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1 FROM "bookings" AS b
                            INNER JOIN "payments" AS p ON b."paymentId" = p."id"
                            WHERE b."roomId" = "rooms"."id"
                              AND b."checkedOut" = false
                              AND (
                                  b."checkInDate" BETWEEN '${checkIn}' AND '${checkOut}'
                                  OR b."checkOutDate" BETWEEN '${checkIn}' AND '${checkOut}'
                                  OR (b."checkInDate" <= '${checkIn}' AND b."checkOutDate" >= '${checkOut}')
                              )
                              AND (
                                  p."paymentStatus" = 'paid'
                                  OR (
                                      p."paymentStatus" = 'pending'
                                      AND p."dueDate" IS NOT NULL
                                      AND p."dueDate" > '${now}'
                                  )
                              )
                        )
                    `)
                ]
            },
            order: [['id', 'ASC']]
        });

        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching available rooms with promotion:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAllTypes = async (req, res) => {
    try {

        const types = await Type.findAll();
        res.status(200).json(types)

    } catch (error) {
        res.status(500).json({ message: "error get types" })

    }
}



