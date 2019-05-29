

'use strict'

const $ = require('jquery')
const {createHash} = require('crypto')
const protobuf = require('sawtooth-sdk/protobuf')
const {
  createContext,
  Signer
} = require('sawtooth-sdk/signing')
const secp256k1 = require('sawtooth-sdk/signing/secp256k1')

// Config variables
const KEY_NAME_USER = 'users-chain.keys'
const API_URL = 'http://localhost:8000/api'

/*
    FAMILY_USER,
    VERSION_USER,
    PREFIX_USER,
    FAMILY_CARS,
    PREFIX_CARS,
    FAMILY_INVITATIONS,
    PREFIX_INVITATIONS


*/

const FAMILY_USER = 'user-chain'
const VERSION_USER = '0.0'
const PREFIX_USER = '714183'

const FAMILY_CARS = 'cars-chain'
const VERSION_CARS = '0.0'
const PREFIX_CARS = '812fb5'

const FAMILY_INVITATIONS = 'invitations-chain'
const VERSION_INVITATIONS = '0.0'
const PREFIX_INVITATIONS = '1a7335'

const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

const makeKeyPair = () => {
  const context = createContext('secp256k1')
  const privateKey = context.newRandomPrivateKey()
  return {
    public: context.getPublicKey(privateKey).asHex(),
    private: privateKey.asHex()
  }
}


const getStateUser = cb => {
    
  $.get(`${API_URL}/state?address=${PREFIX_USER}`, ({ data }) => {
    
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        if (datum.address[7] === '0') processed.assets.push(parsed)
        if (datum.address[7] === '1') processed.transfers.push(parsed)
      }
      return processed
    }, {assets: [], transfers: []}))
  })
}

const getStateCars = (address, cb) => {
  $.get(`${API_URL}/state?address=${PREFIX_CARS + address}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        processed.assets.push(parsed)
      }
      return processed
    }, {assets: []}))
  })
}

const getStateInvitations = cb => {
  $.get(`${API_URL}/state?address=${PREFIX_INVITATIONS}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        if (datum.address[7] === '0') processed.assets.push(parsed)
        if (datum.address[7] === '1') processed.transfers.push(parsed)
      }
      return processed
    }, {assets: [], transfers: []}))
  })
}

// Submit signed Transaction to validator
const submitUpdate = (payload, family, version, prefix, privateKeyHex, cb) => {
  // Create signer
  const context = createContext('secp256k1')
  const privateKey = secp256k1.Secp256k1PrivateKey.fromHex(privateKeyHex)
  const signer = new Signer(context, privateKey)

  // Create the TransactionHeader
  const payloadBytes = Buffer.from(JSON.stringify(payload))

  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: family,
    familyVersion: version,
    inputs: [prefix],
    outputs: [prefix],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
  }).finish()

  // Create the Transaction
  const transactionHeaderSignature = signer.sign(transactionHeaderBytes)


  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
  })

  // Create the BatchHeader
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: [transaction.headerSignature]
  }).finish()

  // Create the Batch
  const batchHeaderSignature = signer.sign(batchHeaderBytes)
  
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: [transaction]
  })

  // Encode the Batch in a BatchList
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish()

  // Submit BatchList to Validator
  $.post({
    url: `${API_URL}/batches`,
    data: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'},
    processData: false,
    success: function( resp ) {
      var id = resp.link.split('?')[1]
      $.get(`${API_URL}/batch_statuses?${id}&wait`, ({ data }) => cb(true))
    },
    error: () => cb(false)
  })
}
const deleteInvitation =(action, asset, private_key, owner, address, refresh)=>{
  submitUpdate(
      {action, asset, owner, address},
      FAMILY_INVITATIONS,
      VERSION_INVITATIONS,
      PREFIX_INVITATIONS,
      private_key,
      success => success ? refresh() : null
    )
}
const deleteCarByAddress =(action, asset, private_key, owner, address, refresh)=>{
  submitUpdate(
      {action, asset, owner, address},
      FAMILY_CARS,
      VERSION_CARS,
      PREFIX_CARS,
      private_key,
      success => success ? refresh() : null
    )
}
module.exports = {
  makeKeyPair,
  getStateUser,
  getStateCars,
  getStateInvitations,
  submitUpdate,
  FAMILY_USER,
  VERSION_USER,
  PREFIX_USER,
  FAMILY_CARS,
  PREFIX_CARS,
  FAMILY_INVITATIONS,
  PREFIX_INVITATIONS,
  VERSION_INVITATIONS,
  deleteInvitation,
  deleteCarByAddress
}
