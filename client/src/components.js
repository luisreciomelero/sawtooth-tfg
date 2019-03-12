
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')

const addSesion = (parent, label) => {
  $(parent).append(`<div>
    <p>El numero a con el que trabajaremos será <span style='color:red'>${label}</span></p>
  </div>`
  );
}

module.exports = {
  addSesion
}
