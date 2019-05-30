
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')
const {createHash} = require('crypto')
const {
  FAMILY_USER,
  VERSION_USER,
  PREFIX_USER,
  FAMILY_CARS,
  PREFIX_CARS,
  FAMILY_INVITATIONS,
  PREFIX_INVITATIONS,
  VERSION_INVITATIONS,
  deleteInvitation
} = require('./state.js')

const addSesion = (parent, current_number, current_id) => {
  $(parent).append(`<div>
    <p>El numero a con el que trabajaremos será <span style='color:red'>${current_number}</span> con id <span style='color:red'>${current_id}</span></p>
      </div>`
  );
}
const addOriginal = (parent, original_number, original_id) => {
  $(parent).append(`<div>
    <p>El numero original es <span style='color:red'>${original_number}</span> con id <span style='color:red'>${original_id}</span></p>
  </div>`
  );
}

const addDataDiv = (parent, user, rol)=>{
  $(parent).empty();
  if (rol == 'Usuario'){
    $(parent).append(`<label>Nombre: ${user.nombre} \n</label>
                    <label>DNI: ${user.dni} \n</label>
                    <label>El usuario dispone de: ${user.numInvitaciones} invitaciones \n</label>
                    <label>Email: ${user.email} \n</label>
                    <label>Invitaciones a cobrar: ${user.wallet} \n</label>`)
  }
  else if(rol == 'Invitado'){
    $(parent).append(`<label>Nombre: ${user.nombre} \n</label>
                    <label>DNI: ${user.dni} \n</label>
                    <label>El usuario dispone de: ${user.numInvitaciones} invitaciones \n</label>
                    <label>Email: ${user.email} \n</label>
                    <label>Invitaciones a pagar: ${user.wallet} \n</label>`)
  }

}

const addTableUsers = (parent, users, claseFila) => {
  $(parent).empty();
  var clase = claseFila+'Usuario'
  console.log("Users que llegan al metodo: ", users)
  
  $(parent).append(`<tr id="cabecera">
                            <th>Nombre</th>
                            <th>DNI</th>
                            <th>Telefono</th>
                            <th>Rol</th>
                            <th>Clave publica</th>
                          </tr>`)
  for(var i=0; i<users.users.length; i++){
    const usuario ={nombre:null, dni:null, telefono:null, public_key:null, rol:null}
    console.log("USUARIO DENTRO DEL BUCLE: ", usuario)
    var userAsset = users.users[i].asset.split(',');
    console.log("userAsset: ", userAsset)
    for(var j=0; j<userAsset.length;j++){
      var field = userAsset[j].split(":");
      switch(field[0]){
        case "nombre":
          usuario.nombre = field[1];
          console.log("usuario.nombre: ", usuario.nombre)
          break;
        case "dni":
          usuario.dni = field[1];
          break;
        case "telefono":
          usuario.telefono = field[1];
          break;
        case "rol":
          usuario.rol = field[1];
          break;
        case "public":
          usuario.public_key = field[1];
          break;
      }
    }
    console.log("usuario: ",usuario)
    $(parent).append(`<tr>
                              <td data-asset="${userAsset.join()}">${usuario.nombre}<td>
                              <td>${usuario.dni}<td>
                              <td>${usuario.telefono}<td>
                              <td>${usuario.rol}<td>
                              <td>${usuario.public_key}<td>
                              <button class="${clase}">${claseFila} Usuario</button>
                              </tr>`)
  
  }
}
const addTableCoches = (parent, coches, claseFila) => {
  $(parent).empty();
  var clase = claseFila+'Coche'
  console.log("coches que llegan al metodo: ", coches)
  
  $(parent).append(`<tr id="cabecera">
                            <th>Matricula</th>
                            <th>Modelo</th>
                            <th>Propietario</th>
                          </tr>`)
  for(var i=0; i<coches.coches.length; i++){
    const coche ={matricula:null, modelo:null, propietario:null}
    console.log("USUARIO DENTRO DEL BUCLE: ", coches)
    var cocheAsset = coches.coches[i].asset.split(',');
    console.log("userAsset: ", cocheAsset)
    for(var j=0; j<cocheAsset.length;j++){
      var field = cocheAsset[j].split(":");
      switch(field[0]){
        case "modelo":
          coche.modelo = field[1];
          //console.log("usuario.nombre: ", usuario.nombre)
          break;
        case "matricula":
          coche.matricula = field[1];
          break;
      }
    }
    console.log("usuario: ",coche)
    $(parent).append(`<tr>
                              <td data-asset="${cocheAsset.join()}">${coche.matricula}<td>
                              <td>${coche.modelo}<td>
                              <td>${coches.coches[i].signer}<td>
                              <button class="${clase}">${claseFila} Coche</button>
                            </tr>`)
  
  }
}


const addTableInvitaciones = (parent, invitaciones, claseFila) => {

  $(parent).empty();
  var clase = claseFila+'Invitacion'
  console.log("invitaciones que llegan al metodo: ", invitaciones)
  
  $(parent).append(`<tr id="cabecera">
                      <th>Invitacion de</th>
                      <th>Publicada en</th>
                      <th></th>
                    </tr>`)
  for(var i=0; i<invitaciones.invitaciones.length; i++){
    const invitacion ={invitacion_de:null, fecha:null, address: null}
    console.log("USUARIO DENTRO DEL BUCLE: ", invitaciones)
    var invitacionAsset = invitaciones.invitaciones[i].asset.split(',');
    console.log("invitacionAsset: ", invitacionAsset)
    for(var j=0; j<invitacionAsset.length;j++){
      var field = invitacionAsset[j].split(":");
      console.log("field", field)
      switch(field[0]){
        case "invitacion_de":
          invitacion.invitacion_de = field[1];
          
          //console.log("usuario.nombre: ", usuario.nombre)
          break;
        case "timestamp":
          invitacion.fecha = field[1];
          break;
        case "address":
          console.log("Address dentro de addTable: ", field[1])
          invitacion.address = field[1];
          break;
      }
    }
    console.log("invitacion: ",invitacion)
    $(parent).append(`<tr>
                        <td data-address="${invitacion.address}" data-asset="${invitacionAsset.join()}">${invitacion.invitacion_de}<td>
                        <td>${invitacion.fecha}<td>
                        <button class="${clase}">${claseFila} Invitacion</button>
                        
                      </tr>`)

  
  console.log('data-asset: ', $(`#${invitacion.invitacion_de}`).attr('data-asset'))
  }

}

const deleteOptionAdmin = () =>{
  
    var opciones = ["none:Selecciona Rol...","Invitado:Invitado", "Usuario:Usuario"]
  
    console.log("opciones: ", opciones)
    $("#roles").empty();

    for(var i=0; i<opciones.length; i++){
      var valor = opciones[i].split(":")[0]
      var texto = opciones[i].split(":")[1]
      $('#roles').append(
          $(`<option value="${valor}">${texto}</option>`));
    }

  
  
  
}

const addCategory = (categ, val) =>{
  const value = val.toString()
  const category = categ.toString()
  const catVal = category+":"+val 
  console.log("catVal")
  console.log(catVal)
  return catVal
}

const getHashUser = (key) =>{
  const stringUP = key;
  const hashUP70 = createHash('sha512').update(stringUP).digest('hex')
  const hashUP32 = hashUP70.substr(0,16)
  return hashUP32
}

const compruebaCampos = (fields) =>{
  var comprueba = 1
  console.log("ENTRA EN COMPRUEBA CAMPOS")
  for (var i=0; i<fields.length; i++){
    if(fields[i]=="" || fields[i]== "none"){
      comprueba = 0
      alert("Debe Introducir todos los campos");
      return comprueba;
    }
  }
  return comprueba
}

const limpiaInputs = () =>{
  $("#nameInputR").val('')
  $("#dniInputR").val('')
  $("#emailInputR").val('')
  $("#passInputR").val('')
  $("#tfnInputR").val('')
  $("#mailInputL").val('')
  $("#passInputL").val('')
  $("#matriculaRC").val('')
  $("#modelRC").val('')
  $("#numInv").val('')
  

}

const mostrarMain = (rol, user, invitaciones=null, inviEdit=null)=>{
  if(inviEdit!=null){
    return;
  }
  switch (rol) {
    case 'Invitado':
      $('#mainInvitado').attr('style', '')
      $('#login').attr('style', 'display:none')
      $('#logout').attr('style', '')
      addDataDiv('#datosInvitado', user, rol)
      break;
    case 'Usuario':
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

const generateAddress_user = (email, psw, rol)=>{
  const hashUP32 = getHashUser(email);
  switch(rol){
    case 'Admin':
      return PREFIX_USER + '00' + hashUP32;
    case 'Usuario':
      return PREFIX_USER + '01' + hashUP32;
    case 'Invitado':
      return PREFIX_USER + '01' + hashUP32;
    
  }

}

const concatString = (var1, var2) =>{
  const string1 = var1.toString()
  const string2 = var2.toString().substring(5,10)
  return string1.concat(string2)
}

const fillUserInvitation = (user, invitacionAsset, eliminar)=>{
  var invitacion ={invitacion_de:null, fecha:null, address: null} 
  var invitationSplit =invitacionAsset.split(',')
  for(var j=0; j<invitationSplit.length;j++){
      var field = invitationSplit[j].split(":");
      console.log("field", field)
      switch(field[0]){
        case "invitacion_de":
          invitacion.invitacion_de = field[1];
          break;
        case "timestamp":
          invitacion.fecha = field[1];
          break;
        case "address":
          invitacion.address = field[1];
          break;
      }
    }
  console.log('invitacion: ', invitacion)
  $('#publicadaInvitacion').text('Publicada por: '+user.nombre)
  $('#fechaInvitacion').text('Publicada en: '+ invitacion.fecha)
  $('#estadoInvitacion').text('AUN POR IMPLEMENTAR')
  $('#propietarioInvitacion').text('AUN POR IMPLEMENTAR')
  $('#validaInvitacion').text('AUN POR IMPLEMENTAR')
  eliminar()
}

const eliminarInvitacionAdmin =(invitacionEditar, user, refresh)=>{
  console.log('invitacionEditar', invitacionEditar)
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
  deleteInvitation('delete', asset, private_key, owner, address, ()=>{
    refresh()
  });

}



module.exports = {
  addSesion,
  addOriginal,
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
  fillUserInvitation,
  eliminarInvitacionAdmin
}
