/*
*  Author: 
*     Luis Recio - lreciog@gmail.com
*/

'use strict'
const API_URL = 'http://localhost:8000/api'
const API_NODE = 'http://localhost:5000/api'
const KEY_NAME = 'user-chain.keys'


const {createHash, publicEncrypt} = require('crypto')
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
  PREFIX_INVITATIONS,
  deleteCarByAddress,
  deleteUserByAddress,
  deleteInvitation,
  getAddressesInvitationsAssigned,
  getAddressesInvitationsAssignedCar
} = require('./state.js')

const {
  deleteOptionAdmin,
  addCategory,
  getHashUser,
  compruebaCampos,
  addTableUsers,
  addTableCoches,
  addTableInvitaciones,
  limpiaInputs,
  generateAddress_user,
  concatString,
  fillUserInvitation,
  eliminarInvitacionAdmin,
  addDataDiv,
  addTableInvitacionesSolicitadas,
  addTableCochesInvitado,
  addTableInvitacionesRegistradas,
  addTableInvitacionesPub
}=require('./components')

// Application Object

const user = {owner:null, address:null, keys:{public_key:null, private_key:null},  assets:[], dni:null, 
              nombre:null, phone:null, rol:null, numInvitaciones:null, wallet:null, email: null, psw: null}
const coches = {assets:[], matriculasOwner:[], matriculaInvitado:[]}
const invitaciones = {assets:[], address:null}
const invitaciones_adjudicadas = {assets:[], addressInvitaciones:[], coches:[]}
const version = VERSION_USER
const admin = {users:[], invitaciones:[], coches:[], admin:0}
const registro = {user:null}
const invitacionEditar={ invitacion:[], address:null, fecha:null, invitacion_de:null, private_key:null, numTotal:null}
const invitacionesSolicitadas = {assets:[]}


const getFecha=(currentDate, addTime=null)=>{
  var dia = currentDate.getDate()
  var mes = currentDate.getMonth()
  var anio = currentDate.getFullYear()
  if(addTime!=null){
    const tiempo = addTime * 86400;
    const fecha = currentDate.setSeconds(tiempo)
    dia = currentDate.getDate()
  }
  return ""+dia+"/"+mes+"/"+anio
}
const getRandomNumber = (length) =>{
  return Math.floor(Math.random() * length)
}

const getNodeapiInvitacion = (num) =>{
  console.log("ENTRO EN getNodeapiInvitacion")
  return fetch(`${API_NODE}/luis/invitations/${num}`)
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          console.log(myJson);
          return myJson.invitations
        }).then(function(invitacion){
          alert("Invitacion adjudicada: "+ invitacion.address)
          return invitacion  
        })
}

const getRandomInvitation = ()=>{
  return fetch(`${API_NODE}/luis/NumInvitations/`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            if(myJson.numInvitations == 0){
              alert('No quedan invitaciones en este momento.')
              return
            }
            return myJson.numInvitations;
          }).then(function(numInv){
            var randomNum = getRandomNumber(numInv)
            console.log("NUMERO ALEATORIO: ", randomNum)
            return randomNum
          })
          
}
const getNumUsers = () =>{
  return fetch(`${API_NODE}/luis/NumUsers/`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            
            return myJson.numUsers;
          })
}

const getInvitationAdj= (prefix) =>{

  return fetch(`${API_NODE}/luis/invitation/${prefix}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            console.log("getInvitation address recibida: ", myJson.address)
            return myJson.address;
          })
}


const getAddressBatch = (prefix)=>{
  return fetch(`${API_NODE}/luis/users/${prefix}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            return myJson.address;
          })
          
}

const getAddressCar = (asset)=>{
  return fetch(`${API_NODE}/luis/car/${asset}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson){
            console.log("recibimos: ", myJson.address)
            return myJson.address
          })
}

const getAddressUserByAsset = (asset)=>{
  return fetch(`${API_NODE}/luis/user/${asset}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson){
            console.log("recibimos: ", myJson.address)
            return myJson.address
          })
}
const getAddressesInvitations = (prefix)=>{
  console.log("ENTRAMOS EN getAddressesInvitations")
  return fetch(`${API_NODE}/luis/invitations/address/${prefix}`)
          .then(function(response) {
            console.log("response addresses: ", response)
            return response.json();
          })
          .then(function(myJson){
            console.log("recibimos: ", myJson.addresses)
            return myJson.addresses
          })
} 

const getAddressesCars = (prefix)=>{
  console.log("ENTRAMOS EN getAddressesCars")
  return fetch(`${API_NODE}/luis/cars/address/${prefix}`)
          .then(function(response) {
            console.log("response addresses: ", response)
            return response.json();
          })
          .then(function(myJson){
            console.log("recibimos: ", myJson.addresses)
            return myJson.addresses
          })
} 

const getUserRol = (address)=>{
  return fetch(`${API_NODE}/luis/user/rol/${address}`)
          .then(function(response) {
            console.log("response addresses: ", response)
            return response.json();
          })
          .then(function(myJson){
            console.log("recibimos: ", myJson.addresses)
            return myJson.userRol
          })
}


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
      case "public":
        user.keys.public_key = field[1]
        break;
      case "numInvitaciones":
        user.numInvitaciones = field[1]
        break;
      case "email":
        user.email = field[1];
        break;
      case "psw":
        user.psw = field[1];
        break;
      case "wallet":
        user.wallet = field[1]
        break;
      
    }
  }
  console.log("user: ", user)
}

/*const getDataInvSol = (address, cb)=> {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    
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
}*/

const mostrarMain = (rol, user, invitaciones=null, inviEdit=null)=>{
  if(inviEdit!=null){
    return;
  }
  switch (rol) {
    case 'Invitado':
      invitacionesSolicitadas.assets= []
      $('#mainInvitado').attr('style', '')
      $('#login').attr('style', 'display:none')
      $('#logout').attr('style', '')
      console.log("user y rol que le pasamos al invitado: ", user, rol)
      addDataDiv('#datosInvitado', user, rol)
      
      console.log("Coches registrados: ", coches.assets)
      getAddressesInvitationsAssigned(user.owner.substring(0,16))
      .then(function(invitacionesSolAddress){
        console.log('invitacionesSolAddress', invitacionesSolAddress)
        for (let i =0; i<invitacionesSolAddress.length; i++){
          invitacionesSolicitadas.getInvitation(invitacionesSolAddress[i], '#visualizacionInvitado')

          //data = getDataInvSol(invitacionesSolicitadas[i])
          //addDataTableInvSolMI(data)
        }
      })
      break;
    case 'Vecino':
      $('#mainUser').attr('style', '')
      $('#login').attr('style', 'display:none')
      $('#logout').attr('style', '')
      addDataDiv('#datosUser', user, rol)
      break;
    case 'Admin':
       $('#mainAdmin').attr('style', '')
       $('#login').attr('style', 'display:none')
       $('#logout').attr('style', '')
       break;
    default:
      alert("No hay ningun usuario registrado con esas credenciales")
      break;
       
  }
  
}



const ActualizarAssetUser_publicar = (numInvPub, refreshUserMain) =>{
  const asset = user.assets[0].asset

  var invitacionesActuales = parseInt(user.numInvitaciones)-numInvPub;
  invitacionesActuales=invitacionesActuales.toString()

  const assetNuevo = asset.split(":") 

  assetNuevo.pop()
  assetNuevo.push(invitacionesActuales)

  actualizaInvitacionesUserState("register", assetNuevo.join(':'), user.keys.private_key, user.owner, ()=>{
    deleteUser("delete" , asset, user.keys.private_key, user.owner, ()=>{
      refreshUserMain()
    })
  })

}




const getBatchUser = (address, cb)=> {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    
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


const getAssetInv = (address, cb)=> {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.asset.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {asset: []}))
  })
}

invitacionesSolicitadas.getInvitationPub = function(address, parent) {

  getAssetInv(address, ({ asset }) =>{
    this.assets.push(asset[0])
    console.log("asset recuperado: ", asset, "con address: ", address)
    console.log("assets: ", this.assets)
    addTableInvitacionesPub(parent,this.assets)
  }) 
}

invitacionesSolicitadas.getInvitation = function(address, parent) {
  getAssetInv(address, ({ asset }) =>{
    this.assets.push(asset[0])
    console.log("asset recuperado: ", asset, "con address: ", address)
    console.log("assets: ", this.assets)
    addTableInvitacionesSolicitadas(parent,this.assets)
  }) 
}

invitacionesSolicitadas.getInvitationReg = function(address, parent) {
  getAssetInv(address, ({ asset }) =>{
    this.assets.push(asset[0])
    console.log("asset recuperado: ", asset, "con address: ", address)
    console.log("assets: ", this.assets)
    addTableInvitacionesRegistradas(parent,this.assets)
  }) 
}

const getAllCochesUser = cb => {
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${PREFIX_CARS + user.owner}`, ({ data }) => {
    
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

coches.getCochesReg = function(addTableCochesInvitado){
  getAllCochesUser((assets) =>{
    this.assets = assets
    addTableCochesInvitado()
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
  
  $.get(`${API_URL}/state?address=${PREFIX_INVITATIONS+'00'}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '' && datum.data !== null) {
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
    this.invitaciones = []
    console.log("INVITACIONES DESCARGADAS: ", invitaciones)
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

user.refresh = function (address, mostrarMain) {
  user.address = address
  getBatchUser(address, ({ assets }) => {
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
user.editInvitation = function () {
  getBatchUser(user.address, ({ assets }) => {
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
invitaciones.refresh = function (ActualizarAssetUser_publicar) {
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
  ActualizarAssetUser_publicar();
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



const updateUserSolicitar =(action, asset, private_key, owner, address, rol, update)=>{
  submitUpdate(
      {action, asset, owner, address, rol},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? update() : null
    )
}

const updateInvitation = (action, asset, private_key, owner, address, update)=>{
  submitUpdate(
      {action, asset, owner, address},
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? update() : null
    )
}



const postUser = (action, asset, private_key, owner, rol, actualizaStorage) =>{

    console.log("TRATAMOS DE: ", action)
    submitUpdate(
      {action, asset, owner, rol},
      FAMILY_USER,
      version,
      PREFIX_USER,
      private_key,
      success => success ? actualizaStorage() : null
    )
  
}

coches.update = function(action, asset, private_key, owner, actualizaNumInvitaciones){
  submitUpdate(
      {action, asset, owner},
      FAMILY_CARS,
      version,
      PREFIX_CARS,
      private_key,
      success => success ? this.refresh(actualizaNumInvitaciones) : null
    )
}

coches.refresh = function(actualizaNumInvitaciones) {
  getStateCars(user.owner, ({assets}) => {
    this.assets = assets;
    console.log("coches del invitado: ", this.assets)
    actualizaNumInvitaciones()

  })
}

invitaciones.update = function(action, asset, private_key, owner, ActualizarAssetUser){
  
  submitUpdate(
      {action, asset, owner},
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? this.refresh(ActualizarAssetUser) : null
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

invitacionEditar.refresh = function(address, loadUser){
  console.log("address que queremos recuperar (fuera de comprobar): ", address)

  comprobarRegistro(address, ({user}) =>{
    console.log("address que queremos recuperar (dentro de comprobar): ", address)
    this.invitacion = user
    loadUser()
  })
}

const comprobarRegistro = (address, cb) =>{
  console.log("Visualizacion data:")
  
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        console.log("PARSED:", parsed)
        processed.user.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {user: []}))
  })
}

const comprobarAdmin = () =>{
  console.log("COMPROBAMOS")
  registro.refresh(PREFIX_USER+'00', ()=>{
      deleteOptionAdmin()
    },()=>{
      
  })
}

registro.refresh = function( address, getAlert, postUser){
  comprobarRegistro(address, ({user}) => {

    this.user = user[0];
    console.log("Usuario recuperado")
    console.log(registro.user)
    if(registro.user == undefined){
      postUser()
      return
    }
    else{
      
      getAlert()
      
    }
    
  })
}

const getAlert = (rol, address) =>{
  console.log("ENTRAMOS")
  console.log("pasamos: ", registro.user.asset)
  processAsset(registro.user.asset)
  console.log("rol: ", user.rol, ", address: ", user.address)
  console.log("Entramos en getAlert con rol: ", rol)
  if(rol == 'Admin'){
    alert('No puedes registrarte como Administrador')
    deleteOptionAdmin()
    return;
  }else{
    alert('Ya hay un usuario registrado con este email')
    return;
  }
  
}

const createObjectForStorage= (name, rol, email, password, public_key, private_key)=>{
  var usuario = "nombre:"+name+","+"rol:"+rol+","+"email:"+getHashUser(email)+","+"password:"+ getHashUser(password)+","+"public_key:"+public_key+","+"private_key:"+private_key+"//";
  return usuario
}
const comprobarStorageSession = ()=>{
  getNumUsers().then(function(numUsers){
    console.log("numero de usuarios: ", numUsers)
    if (numUsers == 0){
      localStorage.clear()
    }
  })
}

const addNewUserObject = (userObject)=>{
  getNumUsers().then(function(numUsers){
    console.log("numero de usuarios: ", numUsers)
    
      if(!localStorage.getItem(KEY_NAME)){
        var usuarios = []
        usuarios.push(userObject)
        
        console.log("usuarios: ", usuarios)

        localStorage.setItem(KEY_NAME, usuarios)
        console.log('localStorage: ', localStorage.getItem(KEY_NAME))
      }
      else{
        
        var users = localStorage.getItem(KEY_NAME)
        users = users + userObject;
        console.log('users', users)
      

        localStorage.clear()
        localStorage.setItem(KEY_NAME, users)
        console.log('localStorage: ', localStorage.getItem(KEY_NAME))

      
    }
  })
  
}

$('#registerUser').on('click', function () {
  
  
  comprobarStorageSession()

  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const email = addCategory("email", $('#emailInputR').val());
  const psw = addCategory("psw", $('#passInputR').val());
  const hashUP16A = getHashUser($('#emailInputR').val());
  const hashUP16B = getHashUser($('#passInputR').val());
  const owner = hashUP16A + hashUP16B
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const roleSelect = $('[name="roleSelect"]').val();
  const rol = addCategory("rol", roleSelect);
  const keys = makeKeyPair();
  console.log('keys: ', keys)
  var userObject = createObjectForStorage($('#nameInputR').val(), roleSelect, $('#emailInputR').val(), $('#passInputR').val(), keys.public, keys.private)
  
  const public_key = addCategory("public", keys.public)
  const invitaciones = addCategory("numInvitaciones", "20")
  const invitaciones_invAdm = addCategory("numInvitaciones", "0")
  const wallet = addCategory("wallet", "0")
  const asset_admin = [nombre, dni, owner, telefono, rol, public_key, email, psw, wallet, invitaciones_invAdm]
  const asset_user = [nombre, dni, owner, telefono, rol, public_key, email, psw, wallet, invitaciones]
  const asset_invitado = [nombre, dni, owner, telefono, rol, public_key, email, psw, wallet, invitaciones_invAdm]
  

  const campos = [$('#nameInputR').val(), $('#dniInputR').val(), $('#emailInputR').val(), 
                  $('#passInputR').val(), $('#tfnInputR').val(), $('[name="roleSelect"]').val()]

  var comprueba = compruebaCampos(campos)
  if (comprueba == 0) return;
  
  const address = generateAddress_user($('#emailInputR').val(), $('#passInputR').val(), roleSelect)

  if(roleSelect == 'Admin'){
    deleteOptionAdmin()
    registro.refresh(PREFIX_USER+'00', ()=>{
      getAlert(user.rol, user.address)
    },()=>{
      postUser(action,asset_admin.join(), keys.private, owner, roleSelect, ()=>{
        console.log("VAMOS A ENTRAR EN addNewUserObject")
        addNewUserObject(userObject)
      })
  })
  }
  else if (roleSelect == 'Vecino'){
    registro.refresh(address, ()=>{
      getAlert(user.rol, user.address)
    },()=>{
      postUser(action,asset_user.join(), keys.private, owner, roleSelect, ()=>{
        console.log("VAMOS A ENTRAR EN addNewUserObject")
        addNewUserObject(userObject)
      })
    })
  }else{
    registro.refresh(address, ()=>{
      getAlert(user.rol, user.address)
    },()=>{
      postUser(action,asset_invitado.join(), keys.private, owner, roleSelect, ()=>{
        console.log("VAMOS A ENTRAR EN addNewUserObject")
        addNewUserObject(userObject)
      })
    })
  }
  
  limpiarUser()
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
  
  const hashEmail = getHashUser($('#mailInputL').val());
  const hashPsw = getHashUser( $('#passInputL').val());
  const hashUP32 = hashEmail+hashPsw
  getKeys(hashEmail,hashPsw)
  const address = PREFIX_USER +'00'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  user.refresh(user.address,()=>{
    mostrarMain(user.rol, invitaciones)
  })
  limpiaInputs()
})


const getKeys =(hashEmail, hashPsw)=>{
  console.log('Entro en getKeys')
  var usuarios =localStorage.getItem(KEY_NAME)
  console.log("usuarios: ", usuarios)
  usuarios = usuarios.split('//')
  console.log('email:'+hashEmail+',password:'+hashPsw)
  for (let i=0; i<usuarios.length;i++){
    var usuario = usuarios[i]

    if(usuario.indexOf('email:'+hashEmail+',password:'+hashPsw)>-1){
      var fields = usuario.split(',')
      for (let j =0; j<fields.length; j++){
        var field = fields[j].split(':');
        switch (field[0]){
          case 'private_key':
            user.keys.private_key = field[1];
            break
        }
      }
    }

    
  }
}

const comprobarPrivateKey=()=>{
  if(user.keys.private_key == null){
    alert("Este usuario no tiene permiso para interaccionar con la blockchain")
    return
  }
}

$('#loginButton').on('click', function () {

  var mail = addCategory('email',$('#mailInputL').val());
  var psw = addCategory('psw',$('#passInputL').val());
  var mailPsw = addCategory(mail, psw)
  const hashEmail = getHashUser($('#mailInputL').val());
  const hashPsw = getHashUser( $('#passInputL').val());
  const hashUP32 = hashEmail+hashPsw
  console.log('user antes', user)
  getKeys(hashEmail,hashPsw)
  console.log('user despues', user)
  const address = PREFIX_USER +'01'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  user.rol = null;
  user.refresh(user.address,()=>{
    mostrarMain(user.rol, user)
  })
  limpiaInputs()
})




$('#goToRegister').on('click', function () {
  limpiaInputs()
  comprobarAdmin()
  $('#register').attr('style', '')
  $('#login').attr('style', 'display:none')
})

const getNuevoAssetCrearCoche =(assetPropietario)=>{
  var assetSplit = assetPropietario.split(',')
  console.log("assetSplit en crearcoche", assetSplit)
  var nuevoAsset = []
  for (let i = 0; i<assetSplit.length; i++){
 

    if(assetSplit[i].substring(0,15)=='numInvitaciones' ){
        var valor = parseInt(assetSplit[i].split(':')[1],10)
        valor = valor -1
        valor = valor.toString()
        console.log('invitaciones', valor)
        var invitaciones = addCategory(assetSplit[i].split(':')[0], valor)
        nuevoAsset.push(invitaciones)
      }
    
    else{
      nuevoAsset.push(assetSplit[i])
    }
  }
  console.log('nuevoAsset', nuevoAsset.join(','))
  return nuevoAsset.join(',')

}

const eliminarInvSol = (address, asset)=>{
  console.log("Asset que llega a eliminarSol: ", asset, "address: ", address)
  for (var i= 0; i<invitacionesSolicitadas.assets.length ; i++){
    if(invitacionesSolicitadas.assets[i].asset.indexOf(address)>-1){
      updateInvitation('createCar', asset, user.keys.private_key, user.owner,  address, ()=>{
        console.log('Eliminamos: ', address)
        console.log("inviSOlANTES: ", invitacionesSolicitadas.assets)

        invitacionesSolicitadas.assets.slice(i,1)
        console.log("inviSOlDESPIUES: ", invitacionesSolicitadas.assets)
      })

    }
  }
}



$('#createCocheRC').on('click', function () {
  comprobarPrivateKey()
  $('#visualizacionInvitado').empty()
  console.log("user.assets en create coche: ", user.assets)
  const matricula = addCategory("matricula", $('#matriculaRC').val());
  const model = addCategory("modelo", $('#modelRC').val());
  const propietario = addCategory("propietario", user.owner);
  const currentDate = new Date()
  const fecha = addCategory("registrado_el", getFecha(currentDate))
  console.log("invitacionesSolicitadas: ", invitacionesSolicitadas)
  const randomInvSol = getRandomNumber(invitacionesSolicitadas.assets.length)
  let assetInvRandom = invitacionesSolicitadas.assets[randomInvSol]
  let invAddress = assetInvRandom.asset.split('address:')[1]
  var nuevoAssetInv =[assetInvRandom.asset.split(',address:')[0], matricula, propietario] 
  console.log("NUEVO ASSET INVITACION:", nuevoAssetInv.join())
  eliminarInvSol(invAddress, nuevoAssetInv.join())
  console.log('Sacamos address de inv: ', invAddress)
  invAddress = addCategory("Invitacion", invAddress)
  
  const asset = [matricula, model, propietario, fecha, invAddress]
  const prefixOwner = user.owner.substring(0,16)
  console.log("asset coche: ", asset.join())
  coches.update("register", asset.join(), user.keys.private_key, user.owner, ()=>{
    const prefixUser = PREFIX_USER+'01'+user.owner;
    getAddressBatch(prefixUser).then(function(address){
      var nuevoAsset = getNuevoAssetCrearCoche(user.assets[0].asset)
      console.log("nuevo Asset del user -1 inv: ", nuevoAsset)
      updateUserSolicitar("update", 'assetInvitado', user.keys.private_key, user.owner, address, "Invitado",()=>{
        updateUserSolicitar("register", nuevoAsset, user.keys.private_key, user.owner, address,'Invitado', ()=>{
          user.refresh(user.address, ()=>{
            mostrarMain('Invitado', user)
          })
        })
      })
    })
  })
  $('#regCoche').attr('style', 'display:none')
  //$('#mainInvitado').attr('style', '')
  limpiaInputs()
  
})

$('#createCocheMI').on('click', function () {
  comprobarPrivateKey()
  user.refresh(user.address, ()=>{
    if(user.numInvitaciones>0){
      $('#mainInvitado').attr('style', 'display:none')
      $('#regCoche').attr('style', '')
    }else{
      alert("Necesitas solicitar una invitacion para porder registrar un coche")
  }
  })
  
  
})

$('#publicarInv').on('click', function () {
  comprobarPrivateKey()
  
  if (user.numInvitaciones==0){
    alert("No le quedan invitaciones al usuario")
    return; 
  }
  console.log("antes de comprobar user.numInvitaciones", user.numInvitaciones)
  console.log("lo mismo para numInvPublicar", $('#numInv').val())
  var numInvPublicar = $('#numInv').val()
  var numInvPubInt =parseInt(numInvPublicar,10);
  var numInvitaciones = parseInt(user.numInvitaciones, 10)
  if(numInvPubInt > numInvitaciones){
    console.log("numInvPublicar", numInvPublicar)
    console.log("user.numInvitaciones", user.numInvitaciones)
    alert(`No puede publicar mas de: ${user.numInvitaciones}`)
    return;
  }
  const numInvPub = numInvPubInt;
  for(var i=0; i<numInvPublicar; i++){

    console.log("user.owner en pubINV: ", user.owner)
    var currentDate = new Date();
    console.log("TIMESTAMP: ", currentDate)
    //var date= currentDate.toString().substring(0, 15).replace(/ /g, "")
    var date = getFecha(currentDate)
    console.log("date", date)
    const keys = makeKeyPair();
    const publicrand = concatString(user.keys.public_key, keys.private)
    const propiedad = addCategory("invitacion_de", publicrand)
    const fecha = addCategory("timestamp", date)
    const p_key = user.keys.private_key
    //const private_key = addCategory('private_key', p_key)
    const asset = [propiedad, fecha]
    invitaciones.address = PREFIX_INVITATIONS+user.owner;
    console.log('PUBLICAMOS INVITACION CON ASSET=====================', asset.join())
    console.log('PUBLICAMOS INVITACION CON  P_KEY=====================', user.keys.private_key)
    invitaciones.update("register", asset.join(), user.keys.private_key, user.owner, ()=>{
      ActualizarAssetUser_publicar(numInvPub,()=>{
        user.refresh(user.address,()=>{
          mostrarMain(user.rol, user)
        })
      });
    })
  }
  $('#numInv').val('')
  $('#numInv').attr('placeholder', 'Numero de invitaciones')
})
const getNuevoAssetInvitacion=(invitationSplit)=>{

  /////FALTA METER AL NUEVO PROPIETARIO
  var nuevoAsset = []
      for(var j=0; j<invitationSplit.length;j++){
      var field = invitationSplit[j].split(":");
      console.log("field", field)
      
      switch(field[0]){
        case "invitacion_de":
          
          var invitacion_de = addCategory("invitacionPublicadaPor", field[1])
          var nuevoPropietario = addCategory("nuevoPropietario", user.keys.public_key)
          nuevoAsset.push(invitacion_de)
          nuevoAsset.push(nuevoPropietario)
          break;
        case "timestamp":
          var publicada = addCategory("publicada", field[1])
          nuevoAsset.push(publicada)
          break;
      }
    }
    var currentDate = new Date();
    var dateSol = getFecha(currentDate)
    var solicitada = addCategory("solicitada",dateSol)
    var dateVal = getFecha(currentDate, 1)
    var valida = addCategory("valida", dateVal)
    //var private_key = addCategory("private_key", user.keys.private_key)
    nuevoAsset.push(solicitada)
    nuevoAsset.push(valida)
    //nuevoAsset.push(private_key)
    console.log("Asset nuevo: ", nuevoAsset.join())
    return nuevoAsset.join()
}

const getNuevoAssetUsuario =(assetPropietario, rol)=>{
  var assetSplit = assetPropietario.split(',')
  var nuevoAsset = []
  for (let i = 0; i<assetSplit.length; i++){
  var compara = ((assetSplit[i].substring(0,15)=='numInvitaciones') || (assetSplit[i].substring(0,6)=='wallet'))

    if(rol=="Vecino"){
      compara = (assetSplit[i].substring(0,6)=='wallet')
    }
    if (compara){
      if (assetSplit[i].substring(0,6)=='wallet'){
        var valor = parseInt(assetSplit[i].split(':')[1],10)
        valor = valor +1
        valor = valor.toString()
        console.log('valor', valor)
        var wallet = addCategory(assetSplit[i].split(':')[0], valor)
        nuevoAsset.push(wallet)
      }
      else if(assetSplit[i].substring(0,15)=='numInvitaciones' && rol == 'Invitado'){
        var valor = parseInt(assetSplit[i].split(':')[1],10)
        valor = valor +1
        valor = valor.toString()
        console.log('invitaciones', valor)
        var invitaciones = addCategory(assetSplit[i].split(':')[0], valor)
        nuevoAsset.push(invitaciones)
      }
    }
    else{
      nuevoAsset.push(assetSplit[i])
    }
  }
  console.log('nuevoAsset', nuevoAsset.join(','))
  return nuevoAsset.join(',')
}

$('#solicitarMI').on('click', function () {
  comprobarPrivateKey()
  invitacionesSolicitadas.assets = []
  //addTableInvitaciones('#invitacionesTableSI', invitaciones.assets, "solicitar")
   getRandomInvitation().then(function (randomNum) {
    getNodeapiInvitacion(randomNum).then(function(invitacion){
      console.log("llega invitacion: ", invitacion)
        var data = JSON.parse(atob(invitacion.data))
      console.log("data: ", data)
        var invitationSplit = data.asset.split(',');
        var nuevoAsset = getNuevoAssetInvitacion(invitationSplit)
      console.log("nuevo asset devuelto: ", nuevoAsset)
        const propietarioInv = invitacion.address.substring(8,40)+user.owner.substring(0,16)
        const propietario = invitacion.address.substring(8,40)
        const propietarioAddress =  PREFIX_USER+'01'+ propietario 
      console.log("PROPIETARIO.ADDRESS: ", propietario)
      console.log("USER.ADDRESS: ", user.address)
        const invitadoAddress = PREFIX_USER+'01'+user.address.substring(8,40)
      updateInvitation('delete', nuevoAsset, user.keys.private_key, user.owner, invitacion.address, ()=>{
        updateInvitation("assign", nuevoAsset, user.keys.private_key, propietarioInv , invitacion.address, ()=>{
          getBatchUser(propietarioAddress, ({ assets }) => {
            console.log("address:", assets)
            var assetPropietario = assets[0].asset;
            console.log("ASSET NUEVO PROPIETARIO")
            assetPropietario = getNuevoAssetUsuario(assetPropietario, "Vecino")
            getAddressBatch(propietarioAddress).then(function(address){
              var completeAddress = address;
              console.log("llega address propietario: ", address)
              updateUserSolicitar("update", "asset", user.keys.private_key, propietario, completeAddress, "Vecino",()=>{
                updateUserSolicitar("register", assetPropietario, user.keys.private_key, propietario, completeAddress,'Vecino', ()=>{
                  console.log("UPDATED PROPIETARIO")
                  getBatchUser(invitadoAddress,({assets})=>{
                    var assetInvitado=assets[0].asset;
                    console.log("ASSET NUEVO INVITADO")
                    assetInvitado = getNuevoAssetUsuario(assetInvitado, "Invitado")
                    getAddressBatch(invitadoAddress).then(function(address){
                      var completeAddress = address;
                      console.log("llega address invitado: ", address)
                      updateUserSolicitar("update", assetInvitado, user.keys.private_key, user.owner, completeAddress, "Invitado",()=>{
                        updateUserSolicitar("register", assetInvitado, user.keys.private_key, user.owner, completeAddress,'Invitado', ()=>{
                         user.refresh(user.address, ()=>{
                            mostrarMain(user.rol, user)
                         })
                        })
                      })
                    })
                  });
                })
              })
            })
          })
        })    
      })
      limpiaInputs()
    })
  })
})

$('#verUsuarios').on('click', function () {
  comprobarPrivateKey()
  console.log("TODOS LOS USUARIOS REGISTRADOS: ", admin.users)
  admin.getUsers(()=>{
    addTableUsers('#visualizacion', admin.users, "eliminar")
  })
})

$('#verCoches').on('click', function () {
  comprobarPrivateKey()
  console.log("TODOS LOS COCHES REGISTRADOS: ", admin.coches)
  admin.getCoches(()=>{
    addTableCoches('#visualizacion',admin.coches, "eliminar")
  })
})

$('#verInvitaciones').on('click', function () {
  comprobarPrivateKey()
  admin.getInvitaciones(()=>{
    console.log("TODOS LAS INVITACIONES REGISTRADAS: ", admin.invitaciones)
    addTableInvitaciones('#visualizacion', admin.invitaciones, "eliminar")
  })
  //getbbdd()
})

$('#visualizacion').on('click', '.eliminarInvitacion' ,function(){
  comprobarPrivateKey()
  console.log("has pulsado editarInvitacion", $(this))
  var address = $(this).parent().siblings('td').attr('data-address');
  console.log("address invitacion: ", address)
  invitacionEditar.refresh(address, ()=>{
    user.address = PREFIX_USER+'01'+address.substring(8,40)
    user.refresh(user.address,()=>{
      eliminarInvitacionAdmin(invitacionEditar, user, ()=>{
        admin.getInvitaciones(()=>{
          console.log("TODOS LAS INVITACIONES REGISTRADAS: ", admin.invitaciones)
          addTableInvitaciones('#visualizacion', admin.invitaciones, "eliminar")
        })
      })
    })
  })
})





$('#visualizacion').on('click', '.eliminarCoche' ,function(){
  comprobarPrivateKey()
  console.log("has pulsado eliminarCoche")
  var asset = $(this).parent().siblings('td').attr('data-asset');
  asset = asset.split('/')[0]
  getAddressCar(asset).then(function(address){
    
    deleteCarByAddress('deleteAdmin', asset, user.keys.private_key, user.owner, address, ()=>{
      admin.getCoches(()=>{
        addTableCoches('#visualizacion',admin.coches, "eliminar")
      })
    })
    
  })

})

$('#visualizacion').on('click', '.eliminarUsuario' ,function(){
  comprobarPrivateKey()
  console.log("has pulsado eliminarUsuario")
  var asset = $(this).parent().siblings('td').attr('data-asset');
  console.log("ASSET QUE RECIBO AL PULSAR ELIMINAR: ", asset)
  getAddressUserByAsset(asset).then(function(address){


    console.log("ADDDDRESSSS: ", address)
    const token = address.substring(8,40)
    console.log("token: ", token)
    getUserRol(address).then(function(rol){
      if(rol == 'Invitado'){
        getAddressesInvitationsAssigned(token.substring(0,16)).then(function(addresses){
          console.log('entramos')
          console.log("RECIBIMOS COMO DIRECCIONES: ", addresses)
          for (var i=0; i<addresses.length; i++){
            deleteInvitation('delete', 'asset', user.keys.private_key, user.owner, addresses[i], ()=>{
              console.log("ELIMINADA ADDRESS: ", addresses[i])
            })
          }
        })
        getAddressesInvitationsAssignedCar(token.substring(0,16)).then(function(addresses){
          console.log('entramos en addCar')
          console.log("RECIBIMOS COMO DIRECCIONES: ", addresses)
          for (var i=0; i<addresses.length; i++){
            deleteInvitation('delete', 'asset', user.keys.private_key, user.owner, addresses[i], ()=>{
              console.log("ELIMINADA ADDRESS: ", addresses[i])
            })
          }
        })
      }

      getAddressesInvitations(token).then(function(addresses){
        console.log('entramos')
        console.log("RECIBIMOS COMO DIRECCIONES: ", addresses)
        for (var i=0; i<addresses.length; i++){
          deleteInvitation('delete', 'asset', user.keys.private_key, user.owner, addresses[i], ()=>{
            console.log("ELIMINADA ADDRESS: ", addresses[i])
          })
        }
      })


      getAddressesCars(token).then(function(addresses){
        console.log('entramos en getAddressesCars')
        console.log("RECIBIMOS COMO DIRECCIONES: ", addresses)
        for (var i=0; i<addresses.length; i++){
          deleteCarByAddress('deleteAdmin', asset, user.keys.private_key, user.owner, addresses[i], ()=>{
            console.log("ELIMINADA ADDRESS: ", addresses[i])
          })
        }
      })


    deleteUserByAddress('deleteAdmin', asset, user.keys.private_key, user.owner, address, ()=>{
      admin.getUsers(()=>{
        addTableUsers('#visualizacion',admin.users, "eliminar")
      })
    })
  })
})   
})

$('#volverRC').on('click', function(){
  $('#regCoche').attr('style', 'display:none')
  $('#mainInvitado').attr('style', '')
})

$('#verCochesInv').on('click', function(){
  coches.getCochesReg(()=>{
    addTableCochesInvitado('#visualizacionInvitado', coches.assets)
  })
})

$('#verInvitacionesInv').on('click', function(){
  $('#visualizacionInvitado').empty()
  invitacionesSolicitadas.assets = []
  getAddressesInvitationsAssigned(user.owner.substring(0,16))
      .then(function(invitacionesSolAddress){
        console.log('invitacionesSolAddress', invitacionesSolAddress)
        for (let i =0; i<invitacionesSolAddress.length; i++){
          invitacionesSolicitadas.getInvitation(invitacionesSolAddress[i], '#visualizacionInvitado')
        }
      }) 
})



$('#verInvitacionesPubUsuario').on('click', function(){
  $('#visualizacionVecino').empty()
  invitacionesSolicitadas.assets = []
  getAddressesInvitations(user.owner).then(function(invitacionesPub){
        console.log('entramos')
        console.log("RECIBIMOS COMO DIRECCIONES: ", invitacionesPub)
        for (var i=0; i<invitacionesPub.length; i++){
          invitacionesSolicitadas.getInvitationPub(invitacionesPub[i], '#visualizacionVecino')
        }
      })


})

$('#verInvitacionesSolUsuario').on('click', function(){
  $('#visualizacionVecino').empty()
  invitacionesSolicitadas.assets = []
  getAddressesInvitationsAssigned(user.owner)
      .then(function(invitacionesSolAddress){
        console.log('invitacionesSolAddress', invitacionesSolAddress)
        for (let i =0; i<invitacionesSolAddress.length; i++){
          invitacionesSolicitadas.getInvitation(invitacionesSolAddress[i], '#visualizacionVecino')
        }
      })
})

$('#verInvitacionesRegUsuario').on('click', function(){
  $('#visualizacionVecino').empty()
  invitacionesSolicitadas.assets = []
  getAddressesInvitationsAssignedCar(user.owner)
  .then(function(invitacionesReg){
          console.log('entramos en addCar')
          for (var i=0; i<invitacionesReg.length; i++){
            console.log('INVITACIONES REGISTRADAS: ', invitacionesReg)
            invitacionesSolicitadas.getInvitationReg(invitacionesReg[i], '#visualizacionVecino')
          }
        })

})

$('#logout').on('click', function(){
  limpiarUser()
  $('#login').attr('style', '')
  $('#register').attr('style', 'display:none')
  $('#mainInvitado').attr('style', 'display:none')
  $('#mainUser').attr('style', 'display:none')
  $('#mainAdmin').attr('style', 'display:none')
  $('#regCoche').attr('style', 'display:none')
  $('#solicitarInvitacion').attr('style', 'display:none')
  $('#logout').attr('style', 'display:none')
  $('#editarInvitacion').attr('style', 'display:none')
  $('#invitacionesTableSol').empty()
  $('#visualizacionVecino').empty()
  $('#visualizacionInvitado').empty()
  $('#visualizacion').empty()
  invitacionesSolicitadas.assets= []
  
})


