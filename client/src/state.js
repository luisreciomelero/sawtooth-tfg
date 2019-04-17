

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


const FAMILY_USER = 'user-chain'
const VERSION_USER = '0.0'
const PREFIX_USER = '714183'

const FAMILY_CARS = 'cars-chain'
const VERSION_CARS = '0.0'
const PREFIX_CARS = '812fb5'

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

const getStateCars = cb => {
  $.get(`${API_URL}/state?address=${PREFIX_CARS}`, ({ data }) => {
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
const submitUpdateUser = (payload, privateKeyHex, cb) => {
  // Create signer
  const context = createContext('secp256k1')
  console.log("context")
  console.log(context)
  console.log("privateKeyHex")
  console.log(privateKeyHex)
  console.log("payload")
  console.log(payload)
  const privateKey = secp256k1.Secp256k1PrivateKey.fromHex(privateKeyHex)
  console.log("privateKey")
  console.log(privateKey)
  const signer = new Signer(context, privateKey)
  console.log("signer")
  console.log(signer)

  // Create the TransactionHeader
  const payloadBytes = Buffer.from(JSON.stringify(payload))
  console.log("payloadBytes")
  console.log(payloadBytes)
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: FAMILY_USER,
    familyVersion: VERSION_USER,
    inputs: [PREFIX_USER],
    outputs: [PREFIX_USER],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
  }).finish()
  console.log("transactionHeaderBytes")
  console.log(transactionHeaderBytes)

  // Create the Transaction
  const transactionHeaderSignature = signer.sign(transactionHeaderBytes)
  console.log("transactionHeaderSignature")
  console.log(transactionHeaderSignature)


  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
  })
  console.log("transaction")
  console.log(transaction)

  // Create the BatchHeader
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: [transaction.headerSignature]
  }).finish()
  console.log("batchHeaderBytes")
  console.log(batchHeaderBytes)


  // Create the Batch
  const batchHeaderSignature = signer.sign(batchHeaderBytes)
  
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: [transaction]
  })
  console.log("batch")
  console.log(batch)


  // Encode the Batch in a BatchList
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish()
  console.log("batchListBytes")
  console.log(batchListBytes)

  // Submit BatchList to Validator
  $.post({
    url: `${API_URL}/batches`,
    data: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'},
    processData: false,
    success: function( resp ) {
      console.log("post resp: ")
      console.log(resp.link.split('?'))
      console.log("post resp id: ")
      console.log(resp.link.split('?')[1])
      var id = resp.link.split('?')[1]
      $.get(`${API_URL}/batch_statuses?${id}&wait`, ({ data }) => cb(true))
    },
    error: () => cb(false)
  })
}


const submitUpdateCars = (payload, privateKeyHex, cb) => {
  // Create signer
  const context = createContext('secp256k1')
  console.log("context")
  console.log(context)
  console.log("privateKeyHex")
  console.log(privateKeyHex)
  console.log("payload")
  console.log(payload)
  const privateKey = secp256k1.Secp256k1PrivateKey.fromHex(privateKeyHex)
  console.log("privateKey")
  console.log(privateKey)
  const signer = new Signer(context, privateKey)
  console.log("signer")
  console.log(signer)

  // Create the TransactionHeader
  const payloadBytes = Buffer.from(JSON.stringify(payload))
  console.log("payloadBytes")
  console.log(payloadBytes)
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: FAMILY_CARS,
    familyVersion: VERSION_CARS,
    inputs: [PREFIX_CARS],
    outputs: [PREFIX_CARS],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
  }).finish()
  console.log("transactionHeaderBytes")
  console.log(transactionHeaderBytes)

  // Create the Transaction
  const transactionHeaderSignature = signer.sign(transactionHeaderBytes)
  console.log("transactionHeaderSignature")
  console.log(transactionHeaderSignature)


  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
  })
  console.log("transaction")
  console.log(transaction)

  // Create the BatchHeader
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: [transaction.headerSignature]
  }).finish()
  console.log("batchHeaderBytes")
  console.log(batchHeaderBytes)


  // Create the Batch
  const batchHeaderSignature = signer.sign(batchHeaderBytes)
  
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: [transaction]
  })
  console.log("batch")
  console.log(batch)


  // Encode the Batch in a BatchList
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish()
  console.log("batchListBytes")
  console.log(batchListBytes)

  // Submit BatchList to Validator
  $.post({
    url: `${API_URL}/batches`,
    data: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'},
    processData: false,
    success: function( resp ) {
      console.log("post resp: ")
      console.log(resp.link.split('?'))
      console.log("post resp id: ")
      console.log(resp.link.split('?')[1])
      var id = resp.link.split('?')[1]
      $.get(`${API_URL}/batch_statuses?${id}&wait`, ({ data }) => cb(true))
    },
    error: () => cb(false)
  })
}


module.exports = {
  makeKeyPair,
  getStateUser,
  getStateCars,
  submitUpdateUser,
  submitUpdateCars
}
