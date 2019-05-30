var express = require('express');
var router = express.Router();
var controller = require('../controllers/api.controller');

router.get('/luis/invitations/:position', controller.invitations);
router.get('/luis/NumInvitations/', controller.numInvitations);
router.get('/luis/users/:address', controller.getUser)
router.get('/luis/invitation/:prefix', controller.getInvitation)
router.get('/luis/user/:asset', controller.getAddressUser)
router.get('/luis/car/:asset', controller.getAddressCoche)
router.get('/luis/user/rol/:address', controller.getUserRol)
router.get('/luis/invitations/address/:userToken', controller.getUserInvitations)
router.get('/luis/invitationsAssigned/address/:userToken', controller.getUserInvitationsAssigned)
router.get('/luis/cars/address/:userToken', controller.getUserCars)

module.exports = router;
