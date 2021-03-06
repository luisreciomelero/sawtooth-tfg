var express = require('express');
var router = express.Router();
var controller = require('../controllers/api.controller');

router.get('/luis/invitations/:position', controller.getRandomInvitation);
router.get('/luis/NumInvitations/', controller.numInvitations);
router.get('/luis/NumUsers/', controller.numUsers);
router.get('/luis/users/:address', controller.getUser)
router.get('/luis/invitation/:prefix', controller.getInvitationPub)
router.get('/luis/user/:asset', controller.getAddressUser)
router.get('/luis/car/:asset', controller.getAddressCoche)
router.get('/luis/user/rol/:address', controller.getUserRol)
router.get('/luis/invitations/address/:userToken', controller.getUserInvitations)
router.get('/luis/invitationsAssigned/address/:userToken', controller.getUserInvitationsAssigned)
router.get('/luis/invitationsAssignedCar/address/:userToken', controller.getUserInvitationsAssignedCar)
router.get('/luis/cars/address/:userToken', controller.getUserCars)
//router.get('/luis/invitation/asset/:address', controller.getAssetInvitation)

module.exports = router;
