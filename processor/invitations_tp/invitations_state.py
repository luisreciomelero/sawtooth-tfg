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


def _get_asset_address(asset_name, owner):
    return  INVITATIONSCHAIN_NAMESPACE + owner+ '00' + _get_address(asset_name)


def _get_transfer_address(asset_name, owner):
    return INVITATIONSCHAIN_NAMESPACE + owner+ '01' + _get_address(asset_name)


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

    def get_asset(self, asset, owner):
        return self._get_state(_get_asset_address(asset, owner))

    def get_assetAddress(self, address):
        return self._get_state(address)

    # def get_transfer(self, asset):
    #     return self._get_state(_get_transfer_address(asset))

    def set_asset(self, asset, signer, owner):
        
        address = _get_asset_address(asset, owner )
        print("DIRECCION CREADA: ", address)
        newAsset= _addAddress2Asset(asset, address)
        state_data = _serialize(
            {
                "asset": newAsset,
                "signer": signer
            })

        
        return self._context.set_state(
            {address: state_data}, timeout=self.TIMEOUT)

    # def set_transfer(self, asset):
    #     address = _get_transfer_address(asset)
    #     state_data = _serialize(
    #         {
    #             "asset": asset
    #         })
    #     return self._context.set_state(
    #         {address: state_data}, timeout=self.TIMEOUT)


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

    
    