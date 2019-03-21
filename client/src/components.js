
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')

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

module.exports = {
  addSesion,
  addOriginal
}
