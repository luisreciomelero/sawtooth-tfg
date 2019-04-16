
/*
*  Author: 
*     Luis Recio - lreciog@gmail.com
*/

'use strict'

const $ = require('jquery')
const {
  getState,
  submitUpdate,
  makeKeyPair
} = require('./state.js')

// Application Object

const users = {coches:[], DNIs:[], emails:[], phones:[] }
const user = {DNI:null, coches:[], email:null, phone:null, pass:null, rol:null, numInvitaciones:null}
const invitaciones_pendientes = []

/*users.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers
    $('#sesion').empty()
    if(session.number !== null){
      addSesion('#sesion', session.number.split(',')[0], session.number.split(',')[1]);
      addOriginal('#sesion',  session.original_number.split(',')[0], session.original_number.split(',')[1]);
    } 

    
  })
  
}*/

users.update = function (action, asset, private_key, owner) {
    submitUpdate(
      {action, asset, owner},
      private_key,
      success => success ? this.refresh() : null
    )
  
}


$('#registerUser').on('click', function () {
  const action = 'register'
  console.log("pulso registro")

  const nombre = $('#nameInputR').val();
  const dni = $('#dniInputR').val();
  const psw = $('#passInputR').val();
  const telefono = $('#tfnInputR').val();
  const rol = $('[name="roleSelect"]').val();
  const keys = makeKeyPair();
 // const asset = [nombre, dni, psw, telefono, rol];
  const asset = [nombre, dni]
  console.log("Asset")
  console.log(asset.join())
  console.log("private")
  console.log(keys.private)
  //$('#login').attr('style', '')
  //$('#register').attr('style', 'display:none')

  console.log("Accion")
  console.log(action)

  users.update(action,asset.join(), keys.private, keys.public)
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



//users.refresh()
