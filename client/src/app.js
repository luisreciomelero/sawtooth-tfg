/*
*  Author: 
*     Luis Recio - lreciog@gmail.com
*/

'use strict'
const API_URL = 'http://localhost:8000/api'
const API_NODE = 'http://localhost:5000/api'


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
  limpiaInputs,
  mostrarMain,
  generateAddress_user,
  concatString,
  fillUserInvitation
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

const ActualizarAssetUser_Solicitar = ()=>{

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

/*const getAddressBatch =(address, cb)=> {
 
  
  $.get(`${API_URL}/state?address=${address}`, ({ data }) => {
    
    console.log("FIN Visualizacion")
    cb(data.reduce((processed, datum) => {
      if (datum.address !== '') {
        const parsed = JSON.parse(atob(datum.address))
        console.log("PARSED:", parsed)
        processed.address.push(parsed)
        console.log("processed: ", processed)
      }
      return processed
    }, {address: []}))
  })
}*/

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



const deleteInvitation =(action, asset, private_key, owner, address)=>{
  submitUpdate(
      {action, asset, owner, address},
      FAMILY_INVITATIONS,
      version,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? console.log("INVITACION ELIMINADA") : null
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
      console.log("ENTRAMOS")
      console.log("pasamos: ", registro.user.asset)
      processAsset(registro.user.asset)
      console.log("rol: ", user.rol, ", address: ", user.address)
      getAlert()
      
    }
    
  })
}

const getAlert = (rol, address) =>{
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

$('#registerUser').on('click', function () {
  
  const action = 'register'
  console.log("pulso registro")

  const nombre = addCategory("nombre", $('#nameInputR').val());
  const dni = addCategory("dni", $('#dniInputR').val());
  const email = addCategory("email", $('#emailInputR').val());
  const psw = addCategory("psw", $('#passInputR').val());
  const hashUP16A = getHashUser($('#emailInputR').val());
  const hashUP16B = getHashUser($('#passInputR').val());
  const hashUP32 = hashUP16A + hashUP16B
  const telefono = addCategory("telefono", $('#tfnInputR').val());
  const roleSelect = $('[name="roleSelect"]').val();
  const rol = addCategory("rol", roleSelect);
  const keys = makeKeyPair();
  const private_key = addCategory("private", keys.private)
  const public_key = addCategory("public", keys.public)
  const invitaciones = addCategory("numInvitaciones", "20")
  const invitaciones_invAdm = addCategory("numInvitaciones", "0")
  const wallet = addCategory("wallet", "0")
  const asset_admin = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, email, psw, wallet, invitaciones_invAdm]
  const asset_user = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, email, psw, wallet, invitaciones]
  const asset_invitado = [nombre, dni, hashUP32, telefono, rol, private_key, public_key, email, psw, wallet, invitaciones_invAdm]
  

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
      postUser(action,asset_admin.join(), keys.private, hashUP32, roleSelect)
  })
  }
  else if (roleSelect == 'Usuario'){
    registro.refresh(address, ()=>{
      getAlert(user.rol, user.address)
    },()=>{
      postUser(action,asset_user.join(), keys.private, hashUP32, roleSelect)
    })
  }else{
    registro.refresh(address, ()=>{
      getAlert(user.rol, user.address)
    },()=>{
      postUser(action,asset_invitado.join(), keys.private, hashUP32, roleSelect)
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
  const address = PREFIX_USER +'00'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  //user.rol = null;
  user.refresh(user.address,()=>{
    mostrarMain(user.rol, invitaciones)
  })
  limpiaInputs()
})

$('#loginButton').on('click', function () {
  //limpiarUser()
  var mail = addCategory('email',$('#mailInputL').val());
  var psw = addCategory('psw',$('#passInputL').val());
  var mailPsw = addCategory(mail, psw)
  const hashEmail = getHashUser($('#mailInputL').val());
  const hashPsw = getHashUser( $('#passInputL').val());
  const hashUP32 = hashEmail+hashPsw
  
  const address = PREFIX_USER +'01'+ hashUP32;
  console.log("ADDRESS")
  user.owner = hashUP32
  user.address = address
  user.rol = null;
  user.refresh(user.address,()=>{
    mostrarMain(user.rol)
  })
  limpiaInputs()
})




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

$('#createCocheMI').on('click', function () {
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
    const private_key = addCategory('private_key', p_key)
    const asset = [propiedad, fecha, private_key]
    invitaciones.address = PREFIX_INVITATIONS+user.owner;
    console.log('PUBLICAMOS INVITACION CON ASSET=====================', asset.join())
    console.log('PUBLICAMOS INVITACION CON  P_KEY=====================', user.keys.private_key)
    invitaciones.update("register", asset.join(), user.keys.private_key, user.owner, ()=>{
      ActualizarAssetUser_publicar(numInvPub,()=>{
        user.refresh(user.address,()=>{
          mostrarMain(user.rol)
        })
      });
    })
  }
  
})
const getNuevoAsset=(invitationSplit)=>{

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
    var private_key = addCategory("private_key", user.keys.private_key)
    nuevoAsset.push(solicitada)
    nuevoAsset.push(valida)
    nuevoAsset.push(private_key)
    console.log("Asset nuevo: ", nuevoAsset.join())
    return nuevoAsset.join()
}
const getNuevoAssetSol =(assetPropietario, rol)=>{
  var assetSplit = assetPropietario.split(',')
  var nuevoAsset = []
  for (let i = 0; i<assetSplit.length; i++){
  var compara = ((assetSplit[i].substring(0,15)=='numInvitaciones') || (assetSplit[i].substring(0,6)=='wallet'))

    if(rol=="Usuario"){
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
  
  //addTableInvitaciones('#invitacionesTableSI', invitaciones.assets, "solicitar")
   getRandomInvitation().then(function (randomNum) {
    getNodeapiInvitacion(randomNum).then(function(invitacion){
      console.log("llega invitacion: ", invitacion)
      var data = JSON.parse(atob(invitacion.data))
      console.log("data: ", data)
      var invitationSplit = data.asset.split(',');
      var nuevoAsset = getNuevoAsset(invitationSplit)
      console.log("nuevo asset devuelto: ", nuevoAsset)
      const propietario = invitacion.address.substring(8,40)
      const propietarioAddress =  PREFIX_USER+'01'+ propietario
      console.log("PROPIETARIO.ADDRESS: ", propietario)
      console.log("USER.ADDRESS: ", user.address)
      const invitadoAddress = PREFIX_USER+'01'+user.address.substring(8,40)
      updateInvitation('delete', nuevoAsset, user.keys.private_key, user.owner, invitacion.address, ()=>{
        updateInvitation("assign", nuevoAsset, user.keys.private_key, propietario , invitacion.address, ()=>{
          getBatchUser(propietarioAddress, ({ assets }) => {
            console.log("address:", assets)
            var assetPropietario = assets[0].asset;
            console.log("ASSET NUEVO PROPIETARIO")
            assetPropietario = getNuevoAssetSol(assetPropietario, "Usuario")
            getAddressBatch(propietarioAddress).then(function(address){
              var completeAddress = address;
              console.log("llega address propietario: ", address)
              updateUserSolicitar("update", "asset", user.keys.private_key, propietario, completeAddress, "Usuario",()=>{
                updateUserSolicitar("register", assetPropietario, user.keys.private_key, propietario, completeAddress,'Usuario', ()=>{
                  console.log("UPDATED PROPIETARIO")
                  getBatchUser(invitadoAddress,({assets})=>{
                    var assetInvitado=assets[0].asset;
                    console.log("ASSET NUEVO INVITADO")
                    assetInvitado = getNuevoAssetSol(assetInvitado, "Invitado")
                    getAddressBatch(invitadoAddress).then(function(address){
                      var completeAddress = address;
                      console.log("llega address invitado: ", address)
                      updateUserSolicitar("update", assetInvitado, user.keys.private_key, user.owner, completeAddress, "Invitado",()=>{
                        updateUserSolicitar("register", assetInvitado, user.keys.private_key, user.owner, completeAddress,'Invitado', ()=>{
                         user.refresh(user.address, ()=>{
                            console.log("USER.ADDRESS EN SOL: ", user.address)
                         } )
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
  /*$('#solicitarInvitacion').attr('style', '')
  $('#mainInvitado').attr('style', '')*/
  limpiaInputs()
})
})
})
/*$('#solicitarInv').on('click', function () {
  //var randomNum = getRandomNum(invitacionEditar.numTotal)

 
  
  
  
  limpiaInputs()
})*/
$('#verUsuarios').on('click', function () {

  console.log("TODOS LOS USUARIOS REGISTRADOS: ", admin.users)
  admin.getUsers(()=>{
    addTableUsers(admin.users, "editar")
  })
})

$('#verCoches').on('click', function () {
  console.log("TODOS LOS COCHES REGISTRADOS: ", admin.coches)
  admin.getCoches(()=>{
    addTableCoches(admin.coches, "editar")
  })
})

$('#verInvitaciones').on('click', function () {
  
  admin.getInvitaciones(()=>{
    console.log("TODOS LAS INVITACIONES REGISTRADAS: ", admin.invitaciones)
    addTableInvitaciones('#visualizacion', admin.invitaciones, "editar")
  })
  //getbbdd()
})

$('#visualizacion').on('click', '.editarInvitacion' ,function(){
  console.log("has pulsado editarInvitacion")
  var address = $(this).parent().siblings('td').attr('data-address');
  $('#mainAdmin').attr('style', 'display:none')
  $('#editarInvitacion').attr('style', '')
  invitacionEditar.refresh(address, ()=>{
    user.address = PREFIX_USER+'01'+address.substring(8,40)
    user.refresh(user.address,()=>{
      console.log('invitacionEditar', invitacionEditar)
    fillUserInvitation(user, invitacionEditar.invitacion[0].asset)
  })
  })
  console.log("user.address: ", PREFIX_USER+'01'+address.substring(8,40))

  /*user.address = PREFIX_USER+'01'+address.substring(6,38)
  user.refresh(()=>{
    fillUserInvitation(user, invitacionEditar.invitacion[0].asset)
  })*/

})
$('#eliminarInvitacion').on('click' ,function(){
  console.log("he pulsado BORRAR")
  var invitationSplit = invitacionEditar.invitacion[0].asset.split(',');
  console.log('INVITACION: ', invitacionEditar.invitacion[0])
  console.log('InvitacionSplit', invitationSplit)
  for(var j=0; j<invitationSplit.length;j++){
      var field = invitationSplit[j].split(":");
      console.log("field", field)
      switch(field[0]){
        case "invitacion_de":
          invitacionEditar.invitacion_de = field[1];
          break;
        case "timestamp":
          invitacionEditar.fecha = field[1];
          break;
        case "address":
          invitacionEditar.address = field[1];
          break;
        case "private_key":
          invitacionEditar.private_key = field[1];
          break;
      }
    }  
  var asset = invitacionEditar.invitacion[0].asset.replace("\n"," ");
  asset = asset.split(',address')[0]
  var private_key = user.keys.private_key;
  var owner = invitacionEditar.address.substring(8,40);
  console.log('BORRAMOS INVITACION CON ASSET=====================', asset)
  console.log('BORRAMOS INVITACION CON  P_KEY=====================', user.keys.private_key)
  var address = invitacionEditar.address
  deleteInvitation('delete', asset, private_key, owner, address);
})

$('#visualizacion').on('click', '.editarUsuario' ,function(){
  console.log("has pulsado editarUsuario")
  var valores = $(this).parent().siblings('td').html();
  console.log("hermanos: ",  $(this).parent().siblings('td').html())
})

$('#visualizacion').on('click', '.editarCoche' ,function(){
  console.log("has pulsado editar desde js")
  var valores = $(this).parent().siblings('td').html();
  console.log("hermanos: ",  $(this).parent().siblings('td').html())
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
  
})
