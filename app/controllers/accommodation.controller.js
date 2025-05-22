const db = require("../models/");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");

const Rooms = db.rooms;
const Type = db.type;
const Booking = db.booking;
const Facility = db.facility;
const Promotion = db.promotion;

exports.getAll = async (req, res) => {
    try {
        const room = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name", "room_size", "view", "bed_type"],
                    include: [
                        {
                            model: Facility,
                            as: "facilities",
                            attributes: ["name"],
                            through: {
                                attributes: [] // Exclude the join table attributes
                            }
                        }
                    ]
                },
            ],
        });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Rooms" });
    }
};

exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Rooms.findAll({
            include: [
                {
                    model: Type,
                    as: "type",
                    attributes: ["name"],
                    include: [
                        {
                            model: Facility,
                            as: "facilities",
                            attributes: ["name"],
                            through: {
                                attributes: [] // Exclude the join table attributes
                            }
                        }
                    ]
                },
                {
                    model: Promotion,
                    as: "promotions",
                    required: true, //  ให้ return เฉพาะที่ JOIN แล้วมี promotion
                    through: { attributes: [] }, // ซ่อนข้อมูลในตาราง join
                    attributes: ["name", "discount"]
                }
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
        // Parse query parameters with fallback/default
        const checkIn = req.query.checkIn;
        const checkOut = req.query.checkOut;
        const adults = parseInt(req.query.adults) || 1;
        const children = parseInt(req.query.children) || 0;
        const selectedTypes = req.query.selectedTypes || "";

        // Validate required dates
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "Please provide checkIn and checkOut dates." });
        }

        // Find rooms with availability and matching filters
        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    required: false,
                    attributes: [],
                    where: {
                        checkedOut: false,
                        [Op.or]: [
                            {
                                checkInDate: { [Op.between]: [checkIn, checkOut] }
                            },
                            {
                                checkOutDate: { [Op.between]: [checkIn, checkOut] }
                            },
                            {
                                checkInDate: { [Op.lte]: checkIn },
                                checkOutDate: { [Op.gte]: checkOut }
                            }
                        ]
                    }
                },
                {
                    model: Type,
                    as: "type",
                    attributes: ["name"],
                    where: selectedTypes ? {
                        name: { [Op.like]: `%${selectedTypes}%` }
                    } : undefined,
                    include: [
                        {
                            model: Facility,
                            as: "facilities",
                            attributes: ["name"],
                            through: { attributes: [] }
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.literal(`"rooms"."max_adults" >= ${adults}`),
                    Sequelize.literal(`"rooms"."max_children" >= ${children}`),
                    Sequelize.literal(`"rooms"."max_adults" + "rooms"."max_children" >= ${adults + children}`)
                ]
            }
        });

        res.status(200).json(rooms);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.getRoomCountByType = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        // console.log("checkIn", checkIn, "checkOut", checkOut);

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "Please provide checkIn and checkOut dates" });
        }

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
                                checkOutDate: { [Op.gt]: checkIn }
                            }
                        }
                    ]
                }
            ]
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
    const { checkIn, checkOut} = req.query;
    // res.send("checkIn: " + checkIn + " checkOut: " + checkOut + " guests: " + guests + " selectedTypes: " + selectedTypes);

    // ตรวจสอบว่ามีการส่ง checkIn และ checkOut มาหรือไม่
    if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Please provide checkIn and checkOut dates" });
    }
    try {
        // ดึงห้องทั้งหมดพร้อมจองที่ทับช่วงวันที่เข้ามา
        const rooms = await Rooms.findAll({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    required: false, // ดึงห้องที่มีหรือไม่มี booking ก็ได้
                    where: {
                        checkedOut: false, // ห้องที่ยังไม่ถูกเช็กเอาท์
                        [Op.or]: [
                            {
                                checkInDate: {
                                    [Op.between]: [checkIn, checkOut]
                                }
                            },
                            {
                                checkOutDate: {
                                    [Op.between]: [checkIn, checkOut]
                                }
                            },
                            {
                                checkInDate: { [Op.lte]: checkIn },
                                checkOutDate: { [Op.gte]: checkOut }
                            }
                        ]
                    },
                    attributes: ["id"],
                },
                {
                    model: Type,
                    as: "type",
                    attributes: ["name"],
                }
            ],
        });

        // กรองเอาห้องที่ไม่มี booking ทับช่วงเวลานั้น (rooms ที่ไม่มี booking ใน include)
        // const availableRooms = rooms.filter(room => room.bookings.length === 0);

        return res.status(200).json(rooms);

    } catch (error) {
        console.error("Error checking available rooms:", error);
        throw error;
    }
}

exports.getAllTypes = async (req, res) => {
    try {

        const types = await Type.findAll();
        res.status(200).json(types)
        
    } catch (error) {
        res.status(500).json({message: "error get types"})
        
    }
}

