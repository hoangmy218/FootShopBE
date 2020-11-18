const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/Auth.Controller');
// const auth = require('../middleware/auth')
const auth_validate = require('../controllers/Validate.controller');
const auth = auth_validate.validate;
const { validate } = require('../validator');

router.post('/signup', auth_controller.auth_signup);
router.post('/login', auth_controller.auth_login);
router.get('/profile/me', auth, auth_controller.auth_me);
router.post('/logout',auth, auth_controller.auth_logout);
router.post('/logoutall', auth, auth_controller.auth_logoutall);
router.post('/register', auth_controller.auth_register);
router.post('/update', auth, auth_controller.auth_update);
module.exports = router;