import hashlib
import json
import logging
import os


LOGGER = logging.getLogger(__name__)


INVITATIONSCHAIN_NAMESPACE = hashlib.sha512(
    'invitations-chain'.encode('utf-8')).hexdigest()[0:6]

COUNT = 0

def _increment():
    global COUNT
    COUNT= COUNT+1

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

def _comprueba_JSON(fileJSON):
    if os.path.isfile(fileJSON):
        if (COUNT == 0):
            os.remove(fileJSON)

def _addAddress2Asset(asset, address):
        newAsset= asset+',address:'+address
        return newAsset


def _createJson(address, asset, signer):
        _comprueba_JSON("InvitacionesSinAdjudicar.json")

        data = {}
        invitations = []
        invitation = {}

        invitation['address'] = address
        invitation['asset'] = asset
        invitation['signer'] = signer
        
        allAddress = []
        logging.debug("directorio actual : %s", os.getcwd())

        if not os.path.isfile("InvitacionesSinAdjudicar.json"):
            invitation['id'] = 0
            invitations.append(invitation)
            _increment()
            data['InvitacionesSinAdjudicar'] = invitations
            with open('InvitacionesSinAdjudicar.json', mode='a') as outfile:
                json.dump(data, outfile, indent=4, ensure_ascii=False)
        else:
            with open('InvitacionesSinAdjudicar.json','r+') as jsonData:
                invitations_json = json.load(jsonData)
                invitation['id'] = len(invitations_json['InvitacionesSinAdjudicar'])
                for invitacion in invitations_json['InvitacionesSinAdjudicar']:
                    allAddress.append(invitacion['address'])
                if invitation['address'] not in allAddress:
                    invitations_json['InvitacionesSinAdjudicar'].append(invitation)
                _increment()
                with open('InvitacionesSinAdjudicar.json', mode='w') as outfile:
                    json.dump(invitations_json, outfile, indent=4, ensure_ascii=False)


# def _saveAddress(address):
#     invitacionesSinAdjudicar = []
#     if not os.path.isfile("InvitacionesSinAdjudicar.txt"):
#         with open('InvitacionesSinAdjudicar.txt', mode='a') as outfile:
#             outfile.write(address + '\n')
#     else:
#         with open('InvitacionesSinAdjudicar.txt', mode='w') as outfile:
#             for line in  outfile:
#                 if line not in InvitacionesSinAdjudicar:
#                     invitacionesSinAdjudicar.append(line)
#             for pos in invitacionesSinAdjudicar:
#                 outfile.write(pos + '\n')







class InvitationsState(object):

    TIMEOUT = 3

    def __init__(self, context):
        self._context = context

    def get_asset(self, asset, owner):
        return self._get_state(_get_asset_address(asset, owner))

    # def get_transfer(self, asset):
    #     return self._get_state(_get_transfer_address(asset))

    def set_asset(self, asset, signer, owner):
        
        address = _get_asset_address(asset, owner )
        newAsset= _addAddress2Asset(asset, address)
        state_data = _serialize(
            {
                "asset": newAsset,
                "signer": signer
            })

        #_createJson(address, asset, signer)
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


    def delete_asset(self, asset, owner):
        return self._context.delete_state(
            [_get_asset_address(asset, owner)],
            timeout=self.TIMEOUT)

    def _get_state(self, address):
        state_entries = self._context.get_state(
            [address], timeout=self.TIMEOUT)
        if state_entries:
            entry = _deserialize(data=state_entries[0].data)
        else:
            entry = None
        return entry

    
    