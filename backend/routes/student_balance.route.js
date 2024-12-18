const router = require('express').Router()
const {where, Op} = require('sequelize')
const sequelize = require('../db/config/sequelize.config');
const {Student, Student_Balance} = require('../db/models/associations');

// Fetch
router.route('/getStudentBalance').get(async (req, res) => 
  {
    try {
        const data = await Student_Balance.findAll({
            include: [
                {
                    model: Student, 
                }
            ]
        });
        if (data) {
        return res.json(data);
        } else {
        res.status(400);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Error");
    }
});


module.exports = router;