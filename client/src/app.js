
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

const session = {number:null, original_number:null, keys:null, id:0, assets:[], transfers:[],  }
//Este método cargará en el objeto session los elementos de la blockchain
session.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers
    $('#sesion').empty()
    if(session.number !== []) addSesion('#sesion', session.number[0].number);

    
  })
  
}

session.update = function (action, asset, original_number, private_key, owner) {
    submitUpdate(
      {action, asset, original_number, owner},
      private_key,
      success => success ? this.refresh() : null
    )
  
}


$('#registerNumber').on('click', function () {
  
  const id = session.id
  session.id = session.id +1
  console.log('HEMOS PULSADO A REGISTER')
  console.log("ASSETSSSSSS:   ")
  console.log(session.assets)
  const n = $('#numberInput').val();
  console.log(n)
  const number = n.toString()
  var reg = makeKeyPair();
  //CREAMOS LAS VARIABLES QUE ASIGNAREMOS A SESSION
  const name
  const original_number
  const keys
  if (number){
    
    console.log('REG: ')
    console.log(reg)

    name = reg.number + ',' + id.toString()
    original_number = reg.number + ',' + id.toString()
    keys = reg.public +','+ reg.private

    //COMPROBAMOS QUE NO HEMOS INICIADO SESION
    if (session.number == null){
      session.number = name
      session.original_number = original_number
      session.keys = keys
    }else{
      session.number = null
      session.original_number = null
      session.keys = null
      session.number = payload
      session.original_number = original_number
      session.keys = keys
    }
    const public_key = session.keys.split(',')[0]
    const private_key = session.keys.split(',')[1]
    console.log(session)
    console.log('number: ')
    console.log(session.number)
    console.log(session.original_number)
    console.log(session.number.keys)
    session.update('register', name, original_number,private_key, public_key);
  } 
})

$('#increaseNumber').on('click', function(){

})


session.refresh()
