
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
  compruebaCampos,
  addTableUsers,
  addTableCoches,
  addTableInvitaciones,
  limpiaInputs
}=require('./components')

// Application Object

const user = {owner:null, address:null, keys:{public_key:null, private_key:null},  assets:[], dni:null, 
              nombre:null, phone:null, rol:null, numInvitaciones:null, wallet:null}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones = {assets:[], address:null}
const invitaciones_adjudicadas = {assets:[], addressInvitaciones:[], coches:[]}
const version = VERSION_USER
const admin = {users:[], invitaciones:[], coches:[], admin:0}



const processAsset = (data) => {
  const arrayDataComas = data.split(',');
  for(var i=0; i<arrayDataComas.length;i++){
    var field = arrayDataComas[i].split(":");
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
      case "private":
        user.keys.private_key = field[1]
        break;
      case "public":
        user.keys.public_key = field[1]
        break;
      case "numInvitaciones":
        user.numInvitaciones = field[1]
        break;
      
    }
  }
  console.log("user: ", user)
}

const concatString = (var1, var2) =>{
  const string1 = var1.toString()
  const string2 = var2.toString().substring(5,10)
  return string1.concat(string2)
}

const ActualizarAssetUser = (numInvPub, refreshUserMain) =>{
  const asset = user.assets[0].asset
  console.log("ASSET VIEJO: ", asset)
  var invitacionesActuales = parseInt(user.numInvitaciones)-numInvPub;

  invitacionesActuales=invitacionesActuales.toString()

  const assetNuevo = asset.split(":")
  console.log("ASSET NUEVO1: ", assetNuevo)

  assetNuevo.pop()
  assetNuevo.push(invitacionesActuales)
  
  console.log("ASSET NUEVO2: ", assetNuevo.join(":"))

  actualizaInvitacionesUserState("register", assetNuevo.join(':'), user.keys.private_key, user.owner, ()=>{
    deleteUser("delete" , asset, user.keys.private_key, user.owner, ()=>{
      refreshUserMain()
    })
  })

}

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

const getBatchInv = cb =>{
  $.get(`${API_URL}/state?address=${invitaciones.address}`, ({ data }) => {
    
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

const getAllUsers = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${PREFIX_USER + '01'}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.users.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {users: []}))
  })
}

const getAllInvitaciones = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${PREFIX_INVITATIONS}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.invitaciones.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {invitaciones: []}))
  })
}

const getAllCoches = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${PREFIX_CARS}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.coches.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {coches: []}))
  })
}

admin.getUsers = function (tablaUsers) {
  getAllUsers((users) =>{
    console.log("users recuperados")
    this.users = users;
    tablaUsers();
  }) 
  
}
admin.getInvitaciones = function (tablaInvitaciones) {
  getAllInvitaciones((invitaciones) =>{
    this.invitaciones = invitaciones
    tablaInvitaciones()
  }) 
}
admin.getCoches = function (tablaCoches) {
  getAllCoches((coches) =>{
    this.coches = coches
    tablaCoches()
  }) 
}

user.refresh = function (mostrarMain) {
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
    mostrarMain()
  })
}

invitaciones.refresh = function (actualizaUser) {
  getBatchInv(({ assets }) => {
    console.log("ASSETS RECUPERADOS")
    console.log(assets)
    this.assets = assets
    console.log("invitaciones.assets")
    console.log(invitaciones.assets)
    for(var i=0; i<invitaciones.assets.length; i++){
      var asset = assets[i].asset
      processAsset(asset)
      
    }
  })
  actualizaUser();
}

invitaciones.getAll = function() {
  getAllInvitaciones((assets) =>{
    this.assets = assets
  }) 
}

const actualizaInvitacionesUserState = (action, asset, private_key, owner, deleteUser) =>{

    console.log("TRATAMOS DE: ", action)
    submitUpdate(
      {action, asset, owner},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? deleteUser() : null
    )
  
}
const deleteUser =(action, asset, private_key, owner, refreshUserMain)=>{
  submitUpdate(
      {action, asset, owner},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? refreshUserMain() : null
    )
}

const postUser = (action, asset, private_key, owner, rol) =>{

    console.log("TRATAMOS DE: ", action)
    submitUpdate(
      {action, asset, owner, rol},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? this.refresh : null
    )
  
}

coches.update = function(action, asset, private_key, owner){
  submitUpdate(
      {action, asset, owner},
      FAMILY_CARS,
      version,
      PREFIX_CARS,
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

invitaciones.update = function(action, asset, private_key, owner, actualizaUser){
  
  submitUpdate(
      {action, asset, owner},
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? this.refresh(actualizaUser) : null
    )
}

const limpiarUser = () =>{
  user.owner = null;
  user.address= null;
  user.keys.public_key= null;
  user.keys.private_key =null;
  user.assets = [];
  user.dni= null;
  user.nombre= null;
  user.phone= null;
  user.rol= null;
  user.numInvitaciones= null;
  user.wallet= null;
}

$('#registerUser').on('click', function () {

  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const hashUP32 = getHashUser($('#emailInputR').val(),$('#passInputR').val());
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const roleSelect = $('[name="roleSelect"]').val();
  const rol = addCategory("rol", roleSelect);
  const keys = makeKeyPair();
  const private_key = addCategory("private", keys.private)
  const public_key = addCategory("public", keys.public)
  const invitaciones = addCategory("numInvitaciones", "20")
  const asset = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, invitaciones]
  
  const campos = [$('#nameInputR').val(), $('#dniInputR').val(), $('#emailInputR').val(), 
                  $('#passInputR').val(), $('#tfnInputR').val(), $('[name="roleSelect"]').val()]

  var comprueba = compruebaCampos(campos)
  if (comprueba == 0) return;
  console.log("Asset")
  console.log(asset.join())
  console.log("keys.private")
  console.log(keys.private)
 
  if($('[name="roleSelect"]').val() == "Admin")deleteOptionAdmin()

  postUser(action,asset.join(), keys.private, hashUP32, roleSelect)
  limpiaInputs()
})

$('#volverLogin').on('click', function(){
  $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')
  limpiaInputs()
})

$('#loginAdmin').on('click', function () {
  //limpiarUser()
  var mail = addCategory('email',$('#mailInputL').val());
  var psw = addCategory('psw',$('#passInputL').val());
  var mailPsw = addCategory(mail, psw)
  
  const hashUP32 = getHashUser($('#mailInputL').val(), $('#passInputL').val());
  const address = PREFIX_USER +'00'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  user.rol = null;
  user.refresh(()=>{
    mostrarMain(user.rol)
  })
  limpiaInputs()
})

$('#loginButton').on('click', function () {
  //limpiarUser()
  var mail = addCategory('email',$('#mailInputL').val());
  var psw = addCategory('psw',$('#passInputL').val());
  var mailPsw = addCategory(mail, psw)
  
  const hashUP32 = getHashUser($('#mailInputL').val(), $('#passInputL').val());
  const address = PREFIX_USER +'01'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  user.rol = null;
  user.refresh(()=>{
    mostrarMain(user.rol)
  })
  limpiaInputs()
})

const mostrarMain = (rol)=>{
  
  
  switch (rol) {
    case 'Invitado':
      $('#mainInvitado').attr('style', '')
      $('#login').attr('style', 'display:none')
      $('#logout').attr('style', '')
        invitaciones.getAll()
      break;
    case 'Usuario':
      $('#mainUser').attr('style', '')
      $('#login').attr('style', 'display:none')
      $('#logout').attr('style', '')
      break;
    case 'Admin':
       $('#mainAdmin').attr('style', '')
       $('#login').attr('style', 'display:none')
       $('#logout').attr('style', '')
       
  }
  
}


$('#goToRegister').on('click', function () {
  limpiaInputs()
  $('#register').attr('style', '')
  $('#login').attr('style', 'display:none')
})


$('#createCocheRC').on('click', function () {
  console.log("user.assets en create coche: ", user.assets)
  const matricula = addCategory("matricula", $('#matriculaRC').val());
  const model = addCategory("modelo", $('#modelRC').val());
  const propietario = addCategory("propietario", user.owner);
  const asset = [matricula, model, propietario]
  coches.update("register", asset.join(), user.keys.private_key, user.owner)
  $('#regCoche').attr('style', 'display:none')
  $('#mainUser').attr('style', '')
  limpiaInputs()
  
})

$('#createCocheMU').on('click', function () {
  $('#mainUser').attr('style', 'display:none')
  $('#regCoche').attr('style', '')
})

$('#publicarInv').on('click', function () {
  if (user.numInvitaciones==0){
    alert("No le quedan invitaciones al usuario")
    return; 
  }
  console.log("antes de comprobar user.numInvitaciones", user.numInvitaciones)
  console.log("lo mismo para numInvPublicar", $('#numInv').val())
  var numInvPublicar = $('#numInv').val();
  if(numInvPublicar > user.numInvitaciones){
    console.log("numInvPublicar", numInvPublicar)
    console.log("user.numInvitaciones", user.numInvitaciones)
    alert(`No puede publicar mas de: ${user.numInvitaciones}`)
    return;
  }
  const numInvPub = numInvPublicar;
  for(var i=0; i<numInvPublicar; i++){

    console.log("user.owner en pubINV: ", user.owner)
    var currentDate = new Date();
    console.log("TIMESTAMP: ", currentDate)
    const keys = makeKeyPair();
    const publicrand = concatString(user.keys.public_key, keys.private)
    const propiedad = addCategory("invitacion_de", publicrand)
    const fecha = addCategory("timestamp", currentDate)
    const asset = [propiedad, fecha]
    invitaciones.address = PREFIX_INVITATIONS+user.owner;
    invitaciones.update("register", asset.join(), user.keys.private_key, user.owner, ()=>{
      ActualizarAssetUser(numInvPub,()=>{
        user.refresh(()=>{
          mostrarMain(user.rol)
        })
      });
    })
  }
  
})

$('#solicitarMI').on('click', function () {
  
  addTableInvitaciones('#invitacionesTableSI', invitaciones.assets)

  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#mainInvitado').attr('style', '')
  limpiaInputs()
})

$('#verUsuarios').on('click', function () {

  console.log("TODOS LOS USUARIOS REGISTRADOS: ", admin.users)
  admin.getUsers(()=>{
    addTableUsers(admin.users)
  })
})

$('#verCoches').on('click', function () {
  console.log("TODOS LOS COCHES REGISTRADOS: ", admin.coches)
  admin.getCoches(()=>{
    addTableCoches(admin.coches)
  })
})

$('#verInvitaciones').on('click', function () {
  console.log("TODOS LAS INVITACIONES REGISTRADAS: ", admin.invitaciones)
  admin.getInvitaciones(()=>{
    addTableInvitaciones('#visualizacion', admin.invitaciones)
  })
})

$('#logout').on('click', function(){
  $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')
  $('#mainInvitado').attr('style', 'display:none')
  $('#mainUser').attr('style', 'display:none')
  $('#mainAdmin').attr('style', 'display:none')
  $('#regCoche').attr('style', 'display:none')
  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#logout').attr('style', 'display:none')
  
})


