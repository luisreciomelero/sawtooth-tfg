const fetch = require('node-fetch');
const atob = require('atob');

exports.invitations = function (req, res, next) {

	fetch('http://rest-api:8008/state?address=1a733500', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(function(response) {
    return response.json();
  }).then(function(response){
    console.log("probamos atob: ", JSON.parse(atob(response.data[req.params.position].data)))
    
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        invitations: response.data[req.params.position]
  })

  })
}

exports.numInvitations = function (req, res, next) {

  fetch('http://rest-api:8008/state?address=1a733500', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    } 
  })
  .catch(error => console.error('Error:', error))
  .then(function(response) {
    return response.json();
  })
  .catch(error => console.error('Error:', error))
  .then(function(response){

      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        numInvitations: response.data.length
  })

  })
}



exports.getUser = function(req,res,next){

  fetch('http://rest-api:8008/state?address=714183', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    } 
  })
  .catch(error => console.error('Error:', error))
  .then(function(response) {
    return response.json();
  })
  .catch(error => console.error('Error:', error))
  .then(function(response){
      var address ="Not Found"
      for (var i =0; i<response.data.length; i++){
        if (response.data[i].address.indexOf([req.params.address])> -1){
          address = response.data[i].address;
          
        }
      }
      console.log("address a devolver: ", address)
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        address: address
  })

  })
}







