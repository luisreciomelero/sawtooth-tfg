
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
const deleteOptionAdmin = () =>{
  $(".roleSelect option[value='Admin']").remove();
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
  compruebaCampos
}
