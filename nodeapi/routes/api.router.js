var express = require('express');
var router = express.Router();
var controller = require('../controllers/api.controller');

// get all todos
var allInvitations = []

router.get('/luis/invitations/:position', controller.invitations);

module.exports = router;