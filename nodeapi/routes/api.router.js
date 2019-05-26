var express = require('express');
var router = express.Router();
var controller = require('../controllers/api.controller');

// get all todos
var allInvitations = []

router.get('/luis/invitations/:position', controller.invitations);
router.get('/luis/NumInvitations/', controller.numInvitations);
router.get('/luis/users/:address', controller.getUser)
router.get('/luis/invitation/:prefix', controller.getInvitation)
router.get('/luis/user/:asset', controller.getAddressUser)
router.get('/luis/car/:asset', controller.getAddressCoche)

module.exports = router;
