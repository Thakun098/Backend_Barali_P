const controller = require('../controllers/calPromotion.controller');

module.exports = (app) => {
    app.get('/api/calculate-promotion', controller.calculatePromotion);
}