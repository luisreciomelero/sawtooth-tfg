import hashlib
import json
import logging
import os


LOGGER = logging.getLogger(__name__)


INVITATIONSCHAIN_NAMESPACE = hashlib.sha512(
    'invitations-chain'.encode('utf-8')).hexdigest()[0:6]

COUNT = 0


def _get_address(key):
    return hashlib.sha512(key.encode('utf-8')).hexdigest()[:30]


def _get_asset_address(asset_name, owner, action):
    if (action == "register"):
        return  INVITATIONSCHAIN_NAMESPACE + '00' +owner+  _get_address(asset_name)
    elif (action == "assign"):
        return  INVITATIONSCHAIN_NAMESPACE + '01' +owner+  _get_address(asset_name)[:14]

def _get_asset_by_address(address, action):
    if(action == "createCar"):
        newAddress = address[0:6] + '02' + address[8:]
        return  newAddress

def _deserialize(data):
    return json.loads(data.decode('utf-8'))


def _serialize(data):
    return json.dumps(data, sort_keys=True).encode('utf-8')


def _addAddress2Asset(asset, address):
        newAsset= asset+',address:'+address
        return newAsset


class InvitationsState(object):

    TIMEOUT = 3

    def __init__(self, context):
        self._context = context

    def get_asset(self, asset, owner, action):
        return self._get_state(_get_asset_address(asset, owner, action))

    def get_assetAddress(self, address):
        return self._get_state(address)

    
    def set_asset(self, asset, signer, owner, action):
        
        address = _get_asset_address(asset, owner, action)
        print("DIRECCION CREADA: ", address)
        newAsset= _addAddress2Asset(asset, address)
        state_data = _serialize(
            {
                "asset": newAsset,
                "signer": signer
            })

        
        return self._context.set_state(
            {address: state_data}, timeout=self.TIMEOUT)



    def set_asset_by_address(self, asset, signer, owner, action, address):
        
        new_address = _get_asset_by_address(address, action)
       
        print("DIRECCION CREADA: ", new_address)
        newAsset= _addAddress2Asset(asset, new_address)
        state_data = _serialize(
            {
                "asset": newAsset,
                "signer": signer
            })

        
        return self._context.set_state(
            {new_address: state_data}, timeout=self.TIMEOUT)


  
    def delete_asset(self, address):
        
        return self._context.delete_state(
            [address],
            timeout=self.TIMEOUT)

    def _get_state(self, address):
        state_entries = self._context.get_state(
            [address], timeout=self.TIMEOUT)
        if state_entries:
            entry = _deserialize(data=state_entries[0].data)
        else:
            entry = None
        return entry

    
    