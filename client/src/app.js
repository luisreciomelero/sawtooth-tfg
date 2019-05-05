
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
const user = {owner:null, address:null, keys:{public_key:null, private_key:null},  assets:[], dni:null, 
              nombre:null, phone:null, rol:null, numInvitaciones:null, wallet:null}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones = {assets:[], address:null}
const invitaciones_adjudicadas = {assets:[], addressInvitaciones:[], coches:[]}
const version = VERSION_USER
const admin = {users:[], invitaciones:[], coches:[]}



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
      /*case "wallet":
        user.wallet = field[1]
        break;
*/
    }
  }
  console.log("user: ", user)
}

const actualizaAdmin = () =>{
  admin.getUsers();
  sleep(3000)
  admin.getInvitaciones();
  sleep(3000)
  admin.getCoches();
}

const concatString = (var1, var2) =>{
  const string1 = var1.toString()
  const string2 = var2.toString().substring(5,10)
  return string1.concat(string2)
}

const ActualizarAssetUser = () =>{
  const asset = user.assets[0].asset
  console.log("ASSET VIEJO: ", asset)
  var invitacionesActuales = parseInt(user.numInvitaciones)-1;
  const address = getAddress(asset, user.owner)
  console.log("QUEREMOS ELIMINAR EL ASSET CON DIRECCION: ", address)
  //users.update("delete" , asset, user.keys.private_key, user.owner)

  invitacionesActuales=invitacionesActuales.toString()
  

  const assetNuevo = asset.split(":")
  console.log("ASSET NUEVO1: ", assetNuevo)

  assetNuevo.pop()
  assetNuevo.push(invitacionesActuales)
  
  console.log("ASSET NUEVO2: ", assetNuevo.join(":"))
  //console.log("USER ANTES DE CREAR EL USUARIO NUEVO: ", user)

  users.update("register", assetNuevo.join(':'), user.keys.private_key, user.owner)
  sleep(4000);
  users.update("delete" , asset, user.keys.private_key, user.owner)

}

const sleep = (ms) => {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > ms) {
      break;
  }
 }
}


const getAddress = (string, owner) =>{
  //hashlib.sha512(key.encode('utf-8')).hexdigest()[:30]
  //USERCHAIN_NAMESPACE +owner+ '00' + _get_address(asset_name)
  var string1 = createHash('sha512').update(string).digest('hex')
  var devolver = PREFIX_USER + owner + '00'+ string1.substring(0,30)
  return devolver
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
  
  $.get(`${API_URL}/state?address=${PREFIX_USER}`, ({ data }) => {
    
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

admin.getUsers = function () {
  getAllUsers((users) =>{
    this.users = users
  }) 
}
admin.getInvitaciones = function () {
  getAllInvitaciones((invitaciones) =>{
    this.invitaciones = invitaciones
  }) 
}
admin.getCoches = function () {
  getAllCoches((coches) =>{
    this.coches = coches
  }) 
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

invitaciones.refresh = function () {
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

    console.log("TRATAMOS DE: ", action)
    submitUpdate(
      {action, asset, owner},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? this.refresh() : null
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

invitaciones.update = function(action, asset, private_key, owner){
  submitUpdate(
      {action, asset, owner},
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? this.refresh() : null
    )
}

/*invitaciones.refresh =  function() {
  getStateInvitations(({assets, transfers}) => {
    this.assets = assets;
    console.log(this.assets)
  })
}*/

$('#registerUser').on('click', function () {

  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const hashUP32 = getHashUser($('#emailInputR').val(),$('#passInputR').val());
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const rol = addCategory("rol", $('[name="roleSelect"]').val());
  const keys = makeKeyPair();
  const private_key = addCategory("private", keys.private)
  const public_key = addCategory("public", keys.public)
  const invitaciones = addCategory("numInvitaciones", "20")
  //const wallet = addCategory("wallet", "0")
  //const asset = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, invitaciones, wallet]
  const asset = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, invitaciones]
  
  const campos = [$('#nameInputR').val(), $('#dniInputR').val(), $('#emailInputR').val(), 
                  $('#passInputR').val(), $('#tfnInputR').val(), $('[name="roleSelect"]').val()]

  var comprueba = compruebaCampos(campos)
  if (comprueba == 0) return;
  console.log("Asset")
  console.log(asset.join())
  console.log("keys.private")
  console.log(keys.private)
  $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')
  if($('[name="roleSelect"]').val() == "Admin"){
    deleteOptionAdmin()
  }
  

  users.update(action,asset.join(), keys.private, hashUP32)
  //users.refresh()
})



$('#loginButton1').on('click', function () {
  const mail = addCategory('email',$('#mailInputL').val());
  const psw = addCategory('psw',$('#passInputL').val());
  const mailPsw = addCategory(mail, psw)
  
  const hashUP32 = getHashUser($('#mailInputL').val(), $('#passInputL').val());
  const address = PREFIX_USER + hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  
  user.refresh()
  $('#loginButton1').attr('style', 'display:none')
  $('#loginButton').attr('style', '')
  //$('#loginButton').click()
})

$('#loginButton').on('click', function () {
  
  console.log("user.rol fuera de refresh: ", user.rol)

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
       actualizaAdmin()
  }

})

$('#goToRegister').on('click', function () {

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
  console.log("user.owner en pubINV: ", user.owner)
  var currentDate = new Date();
  console.log("TIMESTAMP: ", currentDate)
  const keys = makeKeyPair();
  const publicrand = concatString(user.keys.public_key, keys.private)
  const propiedad = addCategory("invitacion_de", publicrand)
  const fecha = addCategory("timestamp", currentDate)
  const asset = [propiedad, fecha]
  invitaciones.address = PREFIX_INVITATIONS+user.owner;
  invitaciones.update("register", asset.join(), user.keys.private_key, user.owner)
  
  $('#publicarInv').attr('style', 'display:none')
  $('#publicarInv2').attr('style', '')
})

$('#publicarInv2').on('click', function () {
  invitaciones.refresh();
  ActualizarAssetUser()
  $('#publicarInv2').attr('style', 'display:none')
  $('#publicarInv3').attr('style', '')
})
$('#publicarInv3').on('click', function () {
  console.log("INVITACIONES: ", invitaciones)
  user.refresh()
  $('#publicarInv3').attr('style', 'display:none')
  $('#publicarInv').attr('style', '')
})


$('#solicitarInv').on('click', function () {
  const matricula = $('#matriculaSI').val();
  const modelo = $('#modelSI').val();
  //getRandomInvitation
  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#mainInvitado').attr('style', '')

})


$('#verUsuarios').on('click', function () {
  console.log("TODOS LOS USUARIOS REGISTRADOS: ", admin.users)
})

$('#verCoches').on('click', function () {
  console.log("TODOS LOS COCHES REGISTRADOS: ", admin.coches)
})
$('#verInvitaciones').on('click', function () {
  console.log("TODOS LAS INVITACIONES REGISTRADAS: ", admin.invitaciones)
})



/////FALTA EL ACCEPT O REJECT INVITACIONES SI LAS HAY. DESPUES DE DEFINIR ESA TP

//if(user.assets != []) user.refresh()
 
/*user.refresh()
coches.refresh()
invitaciones.refresh()
*/