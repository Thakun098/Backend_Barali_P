const db = require("../models")
const Activity = db.activity

exports.getAll = async (req, res) => {
    try {
        const activities = await Activity.findAll()
        res.status(200).json(activities);

    } catch (error) {
        res.status(500).json({ message: "Error fetching Activities" })
    }
}