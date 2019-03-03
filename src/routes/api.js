const router = require('express').Router();
const { isApiUser } = require('./../middleware/apiUserMiddleware')

const { AuthController, ScholarshipController } = require('./../controllers/api');

// router.post('/register', AuthController.registerPost);

router.get('/scholarship-list', isApiUser, ScholarshipController.getScholarshipList)

module.exports = router;