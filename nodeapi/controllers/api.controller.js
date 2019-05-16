const fetch = require('node-fetch');

exports.invitations = function (req, res, next) {
	fetch('http://rest-api:8008/state', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      'address': '1a7335'
    }
  })
  .then(function(response) {
    return response.json();
  }).then(function(response){
    //console.log(response)
    allInvitations = response
    console.log('allInvitations: ', allInvitations.data[0])
      res.status(200).send({
        success: 'true',
        message: 'todos retrieved successfully',
        invitations: response.data[req.params.position]
  })

  })
}