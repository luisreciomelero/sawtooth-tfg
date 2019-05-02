
/*
*  Author: 
*     Luis Recio - lreciog@gmail.com
*/

'use strict'
const API_URL = 'http://localhost:8000/api'

const {createHash} = require('crypto')
const $ = require('jquery')
const {
  getStateUser,
  makeKeyPair,
  getStateCars,
  getStateInvitations,
  submitUpdate,
  FAMILY_USER,
  VERSION_USER,
  PREFIX_USER,
  FAMILY_CARS,
  PREFIX_CARS,
  FAMILY_INVITATIONS,
  PREFIX_INVITATIONS
} = require('./state.js')

const {
  deleteOptionAdmin
}=require('./components')

// Application Object

const users = {assets:[], matriculas:[], DNIs:[], emailsPsw:[], phones:[], dniSigners:[], admin:0}
const user = {owner:null, address:null,  assets:[], DNI:null, nombre:[], coches:[], email:null, phone:null, pass:null, rol:null, numInvitaciones:20 , signer:null}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones = {assets:[]}
const invitaciones_pendientes = []
const version = VERSION_USER

const addCategory = (categ, val) =>{
  const value = val.toString()
  const category = categ.toString()
  const catVal = category+":"+val 
  console.log("catVal")
  console.log(catVal)
  return catVal
}

const getHashUser = (email, password) =>{
  const stringUP = addCategory(email, password);
  const hashUP70 = createHash('sha512').update(stringUP).digest('hex')
  const hashUP32 = hashUP70.substr(0,32)
  return hashUP32
}
/*const getBatch = (address) =>{
  console.log(address)
  var datBat= [];
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    for(var i=0; i<data.length; i++){
      console.log(JSON.parse(atob(data[i].data)))
      datBat.push(JSON.parse(atob(data[i].data)))
      console.log("datBat antes de salir del bucle")
      console.log(datBat)
    }
    return datBat
  })
  //return datBat
}
*/
/*const getBatch = (address) =>{
  console.log(address)
  var datBat= [];
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        if (datum.address[7] === '0') processed.assets.push(parsed)
        if (datum.address[7] === '1') processed.transfers.push(parsed)
      }
      return processed
    }, {assets: [], transfers: []}))
  }
*/
/*
const getBatch = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${PREFIX_USER}`, ({ data }) => {
    console.log(JSON.parse(atob(data[0].data)))
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        processed.assets.push(parsed)
      }
      return processed
    }, {assets: []}))
  })
}*/

user.refresh = function () {
  getBatchUser(({ assets }) => {
    console.log("ASSETS RECUPERADOS")
    console.log(assets)
    this.assets = assets
    console.log("user.assets")
    console.log(user.assets)
    
  })
  
}
const getBatchUser = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${user.address}`, ({ data }) => {
    console.log(JSON.parse(atob(data[0].data)))
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.assets.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {assets: []}))
  })
}

const processAsset = (data) => {
  const arrayData
}
/*
const separateAssetsUser = (asset, signer) =>{
  var dni = "dni"
  var emailPsw = "email"
  var telefono = "telefono"
  var rol = "rol"
  
  var fields = asset.split(",");
  console.log("CAMPOS")
  console.log(fields)
  for(var i=0; i<fields.length;i++){
    var field = fields[i].split(":");
    console.log("FIELD y [0]=>>>>>")
    console.log(field)
    console.log(field[0])
    switch(field[0]){
      case dni:
        console.log("DNI => " + field[1].toString())
        users.DNIs.push(field[1]);
        console.log(users.DNIs)
        break;
      case emailPsw:
        var mailPsw = []
        mailPsw.push(field[1])
        mailPsw.push(field[3])
        var userMailPsw = mailPsw.join(':')
        console.log("userMailPsw => " + userMailPsw)
        users.emailsPsw.push(userMailPsw)
        break;
      case telefono: 
        users.phones.push(field[1])
        break;
      case rol:
        if(field[1]=="Admin"){
          users.admin = 1
          console.log(users)
          deleteOptionAdmin()
        }

        
    }
  }


  
}*/


users.refresh = function () {
  getStateUser(({ assets, transfers }) => {
    this.matriculas = []
    this.DNIs = []
    this.emailsPsw = []
    this.phones = []
    this.dniSigners = []
    this.assets = assets
    console.log("users.assets")
    for(var i=0; i<assets.length; i++){
      var asset = assets[i].asset
      var signer = assets[i].signer
      console.log(asset)
      separateAssetsUser(asset, signer)
      console.log("users")
      console.log(users)
    }
    
    

    
  })
  
}

users.update = function (action, asset, private_key, owner) {
    submitUpdate(
      {action, asset, owner},
      private_key,
      FAMILY_USER,
      version,
      PREFIX_USER,
      success => success ? this.refresh() : null
    )
  
}

coches.update = function(action, asset, private_key, owner){
  submitUpdate(
      {action, asset, owner},
      private_key,
      FAMILY_CARS,
      version,
      PREFIX_CARS,
      success => success ? this.refresh() : null
    )
}

coches.refresh = function() {
  getStateCars(({assets, transfers}) => {
    this.assets = assets;
    console.log(this.assets)
  })
}

invitaciones.update = function(action, asset, private_key, owner){
  submitUpdate(
      {action, asset, owner},
      private_key,
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      success => success ? this.refresh() : null
    )
}

invitaciones.refresh =  function() {
  getStateInvitations(({assets, transfers}) => {
    this.assets = assets;
    console.log(this.assets)
  })
}



$('#registerUser').on('click', function () {

  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const hashUP32 = getHashUser($('#emailInputR').val(),$('#passInputR').val());
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const rol = addCategory("rol", $('[name="roleSelect"]').val());
  const keys = makeKeyPair();
 // const asset = [nombre, dni, psw, telefono, rol];
  const asset = [nombre, dni, hashUP32, telefono, rol]
  console.log("Asset")
  console.log(asset.join())
  console.log("private")
  console.log(keys.private)
 /* $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')*/

  console.log("Accion")
  console.log(action)



  users.update(action,asset.join(), keys.private, hashUP32)
  users.refresh()
})

$('#loginButton').on('click', function () {
  const mail = addCategory('email',$('#mailInputL').val());
  const psw = addCategory('psw',$('#passInputL').val());
  const mailPsw = addCategory(mail, psw)
  //for users.assets()
  const hashUP32 = getHashUser($('#mailInputL').val(), $('#passInputL').val());
  const address = PREFIX_USER + hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  //const data = getBatch(address);
  console.log("user.assets fuera de peticion")
  console.log(user.assets)
  //console.log("DATA TRAS DESCARGA")
  //console.log("data: ", data)
  //console.log("data[0]: ",data[0])
  //const assets = separateAssets(data)
  //console.log(assets)

  console.log("user.owner: ", user.owner)
  user.refresh()
  console.log("user.assets fuera de refresh: ", user.assets)

  /*$('#login').attr('style', 'display:none');
  switch (user.rol) {
    case 'Invitado':
      $('#mainInvitado').attr('style', '')
      break;
    case 'Usuario':
      $('#mainUser').attr('style', '')
      break;
    default:
       $('#mainAdmin').attr('style', '')
  }*/

})

$('#goToRegister').on('click', function () {

  $('#register').attr('style', '')
  $('#login').attr('style', 'display:none')
})


$('#createCocheRC').on('click', function () {
  console.log("user.owner en create coche: ", user.owner)
  const matricula = $('#matriculaRC').val();
  const model = $('#modelRC').val();
  const keys = makeKeyPair();
  coches.update("register", matricula, keys.private, user.owner)
  $('#regCoche').attr('style', 'display:none')
  $('#mainUser').attr('style', '')
  
})

$('#createCocheMU').on('click', function () {
  $('#mainUser').attr('style', 'display:none')
  $('#regCoche').attr('style', '')
})

$('#publicarInv').on('click', function () {
  console.log("user.owner en pubINV: ", user.owner)
  const action = 'register'
  const precio = $('#precioMU').val();
  console.log("PRECIO ====>")
  console.log(precio)
  const keys = makeKeyPair();
  invitaciones.update("register", precio, keys.private, user.owner)


})

$('#solicitarInv').on('click', function () {
  const matricula = $('#matriculaSI').val();
  const modelo = $('#modelSI').val();
  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#mainInvitado').attr('style', '')

})


/////FALTA EL ACCEPT O REJECT INVITACIONES SI LAS HAY. DESPUES DE DEFINIR ESA TP

if(user.assets != []) user.refresh()
 
//users.refresh()
//coches.refresh()
//invitaciones.refresh()
