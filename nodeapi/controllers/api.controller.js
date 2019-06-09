const fetch = require('node-fetch');
const atob = require('atob');

exports.getRandomInvitation = function (req, res, next) {

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
      var address ="No encontrado"
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


exports.getInvitation = function(req,res,next){
  fetch('http://rest-api:8008/state?address=1a733501', {
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
    var address ="No encontrado"
      for (var i =0; i<response.data.length; i++){
        if (response.data[i].address.indexOf([req.params.prefix])> -1){
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


exports.getAddressUser = function(req,res,next){
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
    var address ="No encontrado"
    
      for (var i =0; i<response.data.length; i++){
        const parsed = JSON.parse(atob(response.data[i].data))
        if (parsed.asset == req.params.asset){
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

exports.getAddressCoche = function(req,res,next){
  fetch('http://rest-api:8008/state?address=812fb5', {
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
    var address ="No encontrado"
      for (var i =0; i<response.data.length; i++){
        const parsed = JSON.parse(atob(response.data[i].data))
        if (parsed.asset.indexOf(req.params.asset) > -1){
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


exports.getUserInvitations = function(req,res, next){
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
      const addresses = []
      for (let i = 0; i<response.data.length; i++){
        console.log("direccion: ", response.data[i].address)
        const invitationAddress = response.data[i].address
        if (invitationAddress.indexOf(req.params.userToken)>-1){
          addresses.push(invitationAddress)
        }
      }

      console.log("INVITACIONES: ", addresses)
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        addresses: addresses
  })

  })
}

exports.getUserInvitationsAssigned = function(req,res, next){
  fetch('http://rest-api:8008/state?address=1a733501', {
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
      const addresses = []
      for (let i = 0; i<response.data.length; i++){
        console.log("direccion: ", response.data[i].address)
        const invitationAddress = response.data[i].address
        if (invitationAddress.indexOf(req.params.userToken)>-1){
          addresses.push(invitationAddress)
        }
      }

      console.log("INVITACIONES: ", addresses)
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        addresses: addresses
  })

  })
}
exports.getUserInvitationsAssignedCar = function(req,res, next){
  fetch('http://rest-api:8008/state?address=1a733502', {
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
      const addresses = []
      for (let i = 0; i<response.data.length; i++){
        console.log("direccion: ", response.data[i].address)
        const invitationAddress = response.data[i].address
        if (invitationAddress.indexOf(req.params.userToken)>-1){
          addresses.push(invitationAddress)
        }
      }

      console.log("INVITACIONES: ", addresses)
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        addresses: addresses
  })

  })
}

exports.getUserRol = function(req, res, next){
  fetch(`http://rest-api:8008/state?address=71418301`, {
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
      let asset = "Not found asset with this address"
      for(let i = 0; i<response.data.length; i++){
        if(response.data[i].address == req.params.address){
          asset = JSON.parse(atob(response.data[i].data)).asset
        }
      }
      return asset
  })
  .catch(error => console.error('Error:', error))
  .then(function(asset){
      let rol = 'Usuario'
      if(asset.indexOf('rol:Invitado') > -1){
        rol = 'Invitado'
      }

      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        userRol: rol,
        address: req.params.address
  })

  })
}




exports.getUserCars = function(req,res, next){
  fetch('http://rest-api:8008/state?address=812fb5', {
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
      const addresses = []
      for (let i = 0; i<response.data.length; i++){
        console.log("direccion: ", response.data[i].address)
        const invitationAddress = response.data[i].address
        if (invitationAddress.indexOf(req.params.userToken)>-1){
          addresses.push(invitationAddress)
        }
      }

      console.log("INVITACIONES: ", addresses)
      res.status(200).send({
        success: 'true',
        message: 'invitation retrieved successfully',
        addresses: addresses
  })

  })
}


/*exports.getAssetInvitation = function(req,res, next)=>{
  fetch('http://rest-api:8008/state?address=1a733501', {
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
    
  }
}*/