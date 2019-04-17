
/*
*  Author: 
*     Luis Recio - lreciog@gmail.com
*/

'use strict'

const $ = require('jquery')
const {
  getStateUser,
  submitUpdateUser,
  makeKeyPair,
  getStateCars,
  submitUpdateCars
} = require('./state.js')

// Application Object

const users = {assets:[], matriculas:[], DNIs:[], emailsPsw:[], phones:[], dniSigners:[]}
const user = {DNI:null, nombre:[], coches:[], email:null, phone:null, pass:null, rol:null, numInvitaciones:null, signer:null}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones_pendientes = []

const addCategory = (categ, val) =>{
  const value = val.toString()
  const category = categ.toString()
  const catVal = category+":"+val 
  console.log("catVal")
  console.log(catVal)
  return catVal
}

const separateAssetsUser = (asset, signer) =>{
  var nombre = "nombre"
  var dni = "dni"
  var emailPsw = "email"
  var telefono = "telefono"
  var rol = "rol"
  
  var fields = asset.split(",");
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
      /*case dni:
        dniSigner*/
    }
  }


  
}


users.refresh = function () {
  getStateUser(({ assets, transfers }) => {
    this.coches = []
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
    submitUpdateUser(
      {action, asset, owner},
      private_key,
      success => success ? this.refresh() : null
    )
  
}

coches.update = function(action, asset, private_key, owner){
  submitUpdateCars(
      {action, asset, owner},
      private_key,
      success => success ? this.refresh() : null
    )
}

coches.refresh = function() {
  getStateCars(({assets, transfers}) => {
    this.assets = assets;
    console.log(this.assets)
  })
}


$('#registerUser').on('click', function () {
  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const psw =addCategory("psw", $('#passInputR').val());
  const email = addCategory("email", $('#emailInputR').val());
  var emailPsw = addCategory(email,psw)
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const rol = addCategory("rol", $('[name="roleSelect"]').val());
  const keys = makeKeyPair();
 // const asset = [nombre, dni, psw, telefono, rol];
  const asset = [nombre, dni, emailPsw, telefono, rol]
  console.log("Asset")
  console.log(asset.join())
  console.log("private")
  console.log(keys.private)
  //$('#login').attr('style', '')
  //$('#register').attr('style', 'display:none')

  console.log("Accion")
  console.log(action)

  users.update(action,asset.join(), keys.private, keys.public)
  users.refresh()
})

$('#loginButton').on('click', function () {
  const dni = $('#dniInputL').val();
  const psw = $('#passInputL').val();

  $('#login').attr('style', 'display:none');
  switch (user.rol) {
    case 'Invitado':
      $('#mainInvitado').attr('style', '')
      break;
    case 'Usuario':
      $('#mainUser').attr('style', '')
      break;
    default:
       $('#mainAdmin').attr('style', '')
  }

})

$('#goToRegister').on('click', function () {

  $('#register').attr('style', '')
  $('#login').attr('style', 'display:none')
})


$('#createCocheRC').on('click', function () {
  const matricula = $('#matriculaRC').val();
  const model = $('#modelRC').val();
  const keys = makeKeyPair();
  coches.update("register", matricula, keys.private, keys.public)
  $('#regCoche').attr('style', 'display:none')
  $('#mainUser').attr('style', '')

  
})

$('#createCocheMU').on('click', function () {
  $('#mainUser').attr('style', 'display:none')
  $('#regCoche').attr('style', '')
})

$('#publicarInv').on('click', function () {
  const precio = $('#precioMU').val();
})

$('#solicitarInv').on('click', function () {
  const matricula = $('#matriculaSI').val();
  const modelo = $('#modelSI').val();
  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#mainInvitado').attr('style', '')

})


/////FALTA EL ACCEPT O REJECT INVITACIONES SI LAS HAY. DESPUES DE DEFINIR ESA TP



users.refresh()
