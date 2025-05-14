const db = require("../models/");
const { Op } = require("sequelize")
const Accommodation = db.accommodation;
const Type = db.type;
const Booking = db.booking;

exports.getAll = async (req, res) => {
    try {
        const accommodation = await Accommodation.findAll({
            include: [
                {
                    model: Type,
                    attributes: ["name"]
                }
            ],
            // limit: 2
        })
        res.status(200).json(accommodation)


    } catch (error) {
        res.status(500).json({ message: "Error fetching Accommodations" })
    }
}

exports.getPromotion = async (req, res) => {
    try {
        const promotion = await Accommodation.findAll({
            where: {
                discount: {
                    [Op.ne]: null
                }
            },
            include: [
                {
                    model: Type,
                    attributes: ["name"]
                }
            ]

        })
        res.status(200).json(promotion)


    } catch (error) {
        res.status(500).json({ message: "Error fetching Promotions" })
    }
}

exports.getPopularAccommodation = async (req, res) => {
    try {
        const limitNum = 4;
        const minRatingNum = 4;

        // ดึงข้อมูลที่ทั้งหมดพร้อมข้อมูลการจองและหมวดหมู่
        const accommodations = await Accommodation.findAll({
            include: [
                {
                    model: Type,
                    attributes: ["name"]
                },
                {
                    model: Booking,
                    attributes: ["id", "checkOutRating", "checkInDate", "checkOutDate"],
                }
            ],
        });

        // คำนวณ 1.คะแนนเฉลี่ย และ 2.จำนวนการจอง
        const popularAccommodations = accommodations.map(item => {
            const accommodationObject = item.toJSON();
            const bookings = accommodationObject.bookings || [];
            
            // คำนวณคะแนนเฉลี่ย
            const validRatings = bookings
            .map(b => b.checkOutRating)
            .filter(rating => rating !== null && rating !== undefined && typeof rating === 'number');
            
            const totalRating = validRatings.reduce((acc, rating) => acc + rating, 0);
            const countRating = validRatings.length;
            const averageRating = countRating > 0 ? totalRating / countRating : 0;
            const ratingPercentage = countRating > 0 ? (averageRating / 5) * 100 : 0;

            // คำนวณจำนวนการจองในช่วง 30 วันล่าสุด
            const now = new Date();
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            
            const recentBookings = bookings.filter(b => {
                const bookingDate = new Date(b.checkInDate);
                return bookingDate >= thirtyDaysAgo && bookingDate <= now;
            });

            // คำนวณคะแนนความนิยม (คะแนนรีวิว + จำนวนการจอง)
            const popularityScore = (averageRating * 0.5) + (recentBookings.length * 0.5);
            
            return {
                ...accommodationObject,
                averageRating: parseFloat(averageRating.toFixed(2)),
                ratingPercentage: parseFloat(ratingPercentage.toFixed(2)),
                countRating: countRating,
                countBooking: recentBookings.length,
                popularityScore: parseFloat(popularityScore.toFixed(2)),
            }
        });

        const filteredAccommodations = popularAccommodations
        .filter(acc => acc.averageRating >= minRatingNum)
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limitNum);
        
        console.log(accommodations);
        res.status(200).json(filteredAccommodations);
        
    } catch (error) {
        res.status(500).json({ message: "Error fetching popular accommodations"});
        
    }
}

exports.getSearch = async (req, res) => {
    try {
        const {checkIn, checkOut, guests, selectedTypes } = req.query;
        if (!checkIn && !checkOut) {
            return res.status(400).json({ message: "Please provide checkIn and checkOut" })
        }

        // const whereConditions = {};

        // if (destination) {
        //     whereConditions[Op.or] = [
        //         { name: { [Op.like]: `%${destination}%` } },
        //         { capacity: { [Op.gte]: `%${guests}%` } }
        //     ]
        // }

        const accommodations = await Accommodation.findAll({
            include: [
                {
                    model: Type,
                    attributes: ["name"],
                    where: {
                        name: {
                            [Op.like]: `%${selectedTypes}%`
                        }
                    },
                }
            ],
            where: {
                capacity: {
                    [Op.gte]: guests
                }

            }

        })
        res.status(200).json(accommodations)
    } catch (error) {
        res.status(500).json({ message: "Error fetching Accommodations" })
    }
}
