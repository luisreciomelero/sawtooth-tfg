
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
  deleteOptionAdmin,
  addCategory,
  getHashUser,
  compruebaCampos
}=require('./components')

// Application Object

const users = {assets:[], matriculas:[], DNIs:[], emailsPsw:[], phones:[], dniSigners:[], admin:0}
const user = {owner:null, address:null,  assets:[], dni:null, nombre:null, phone:null, rol:null, numInvitaciones:20}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones = {assets:[]}
const invitaciones_pendientes = []
const version = VERSION_USER

const getBatchUser = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${user.address}`, ({ data }) => {
    
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
  console.log("DATA EN processAsset: ", data)
  const arrayDataComas = data.split(',');
  for(var i=0; i<arrayDataComas.length;i++){
    var field = arrayDataComas[i].split(":");
    console.log("field", field)
    switch(field[0]){
      case "dni":
        user.dni = field[1];
        break;
      case "telefono":
        user.phone = field[1];
        break;
      case "rol": 
        user.rol=field[1];
        break;
      case "nombre": 
        user.nombre = field[1];
        break;

    }
  }
  console.log("user: ", user)
}


user.refresh = function () {
  getBatchUser(({ assets }) => {
    console.log("ASSETS RECUPERADOS")
    console.log(assets)
    this.assets = assets
    console.log("user.assets")
    console.log(user.assets)
    for(var i=0; i<user.assets.length; i++){
      var asset = assets[i].asset
      processAsset(asset)
    }
  })
}

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
  const asset = [nombre, dni, hashUP32, telefono, rol]
  const campos = [$('#nameInputR').val(), $('#dniInputR').val(), $('#emailInputR').val(), 
                  $('#passInputR').val(), $('#tfnInputR').val(), $('[name="roleSelect"]').val()]

  var comprueba = compruebaCampos(campos)
  if (comprueba == 0) return;
  console.log("Asset")
  console.log(asset.join())
  console.log("private")
  console.log(keys.private)
 /* $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')*/

  users.update(action,asset.join(), keys.private, hashUP32)
  //users.refresh()
})

$('#loginButton').on('click', function () {
  const mail = addCategory('email',$('#mailInputL').val());
  const psw = addCategory('psw',$('#passInputL').val());
  const mailPsw = addCategory(mail, psw)
  
  const hashUP32 = getHashUser($('#mailInputL').val(), $('#passInputL').val());
  const address = PREFIX_USER + hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  console.log("user.assets fuera de peticion")
  console.log(user.assets)
  

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
  console.log("user.assets en create coche: ", user.assets)
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

//if(user.assets != []) user.refresh()
 
//users.refresh()
//coches.refresh()
//invitaciones.refresh()
