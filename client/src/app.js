
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')
const {
  addSesion
} = require('./components.js')
const {
  getState,
  submitUpdate,
  makeKeyPair
} = require('./state.js')

// Application Object

const session = {number: [], assets:[], transfers:[]}
//Este método cargará en el objeto session los elementos de la blockchain
session.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers
    $('#sesion').empty()
    if(!session.number.isEmpty()) addSesion('#sesion', session.number);

    
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
  console.log('HEMOS PULSADO A REGISTER')
  const n = $('#numberInput').val();
  console.log(n)
  const number = n.toString()
  var reg = makeKeyPair();
  if (number){
    
    console.log('REG: ')
    console.log(reg)
    session.number.push(reg)
    console.log(session)
    console.log('number: ')
    console.log(number)
    console.log(tipeof(number))
    session.update('register', number);
  } 
})


session.refresh()
