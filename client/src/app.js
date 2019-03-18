
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')
const {
  addSesion
} = require('./components')
const {
  getState,
  submitUpdate,
  makeKeyPair
} = require('./state')

// Application Object

const session = {number: null, assets:[], transfers:[]}
//Este método cargará en el objeto session los elementos de la blockchain
session.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers
    $('#sesion').empty()
    if(session.number !== null) addSesion('#sesion', session.number);

    
  })
  
}

session.update = function (action, asset) {
    submitUpdate(
      {action, asset},
      this.number.private,
      success => success ? this.refresh() : null
    )
  
}


$('#registerNumber').on('click', function () {
  const number = $('#numberInput').val();
  
  if (number){
    var reg = makeKeyPair();
    session.number.push(reg)
    app.update('register', number);
  } 
})


session.refresh()
