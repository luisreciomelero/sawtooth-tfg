
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')
const {createHash} = require('crypto')

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

const addTableUsers = (users) => {
  $(`#visualizacion`).empty();
  
  console.log("Users que llegan al metodo: ", users)
  
  $(`#visualizacion`).append(`<tr id="cabecera">
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
    $(`#visualizacion`).append(`<tr>
                              <td>${usuario.nombre}<td>
                              <td>${usuario.dni}<td>
                              <td>${usuario.telefono}<td>
                              <td>${usuario.rol}<td>
                              <td>${usuario.public_key}<td>
                            </tr>`)
  
  }
}
const addTableCoches = (coches) => {
  $(`#visualizacion`).empty();
  
  console.log("coches que llegan al metodo: ", coches)
  
  $(`#visualizacion`).append(`<tr id="cabecera">
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
    $(`#visualizacion`).append(`<tr>
                              <td>${coche.matricula}<td>
                              <td>${coche.modelo}<td>
                              <td>${coches.coches[i].signer}<td>
                            </tr>`)
  
  }
}


const addTableInvitaciones = (invitaciones) => {

  $(`#visualizacion`).empty();
  
  console.log("invitaciones que llegan al metodo: ", invitaciones)
  
  $(`#visualizacion`).append(`<tr id="cabecera">
                            <th>Invitacion de</th>
                            <th>Publicada en</th>
                          </tr>`)
  for(var i=0; i<invitaciones.invitaciones.length; i++){
    const invitacion ={invitacion_de:null, fecha:null}
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
      }
    }
    console.log("invitacion: ",invitacion)
    $(`#visualizacion`).append(`<tr>
                              <td>${invitacion.invitacion_de}<td>
                              <td>${invitacion.fecha}<td>
                            </tr>`)
  
  }

}
const deleteOptionAdmin = (admin) =>{
  if (admin == 1){
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
  
  
}

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




module.exports = {
  addSesion,
  addOriginal,
  deleteOptionAdmin,
  addCategory,
  getHashUser,
  compruebaCampos,
  addTableUsers,
  addTableCoches,
  addTableInvitaciones
}
