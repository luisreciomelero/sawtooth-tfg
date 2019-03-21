
/*
*  Sawtooth Counter for practise with Hyperledger Sawtooth -> app.js
*  Author: 
*     Luis Recio 
*/

'use strict'

const $ = require('jquery')
const {
  addSesion,
  addOriginal
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
    if(session.number !== null){
      addSesion('#sesion', session.number.split(',')[0], session.number.split(',')[1]);
      addOriginal('#sesion',  session.original_number.split(',')[0], session.original_number.split(',')[1]);
    } 

    
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
  const name = reg.number + ',' + id.toString()
  const original_number = reg.number + ',' + id.toString()
  const keys = reg.public +','+ reg.private
  if (number){
    
    console.log('REG: ')
    console.log(reg)


    //COMPROBAMOS QUE NO HEMOS INICIADO SESION
    if (session.number == null){
      session.number = name
      session.original_number = original_number
      session.keys = keys
    }else{
      session.number = null
      session.original_number = null
      session.keys = null
      session.number = name
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
  const number = session.number
  let increase_number = number.split(',')[0]
  console.log("number antes")
  console.log(increase_number)
  increase_number = parseInt(increase_number)
  increase_number++
  console.log("number despues")
  console.log(increase_number)
  const current_number = increase_number + ','+number.split(',')[1]
  console.log("New num,id")
  console.log(current_number)

  session.number = current_number
  const public_key = session.keys.split(',')[0]
  const private_key = session.keys.split(',')[1]

  session.update('increase', current_number, session.original_number, private_key, public_key);



})


session.refresh()
