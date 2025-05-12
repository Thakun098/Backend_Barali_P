const db = require("../models/");
const { Op } = require("sequelize")
const Accommodation = db.accommodation;
const Type = db.type;

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