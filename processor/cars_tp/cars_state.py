import hashlib
import json
import logging


LOGGER = logging.getLogger(__name__)


CARSCHAIN_NAMESPACE = hashlib.sha512(
    'cars-chain'.encode('utf-8')).hexdigest()[0:6]


def _get_address(key):
    return hashlib.sha512(key.encode('utf-8')).hexdigest()[:62]


def _get_asset_address(asset_name):
    return  USERCHAIN_NAMESPACE + '00' + _get_address(asset_name)


def _get_transfer_address(asset_name):
    return USERCHAIN_NAMESPACE + '01' + _get_address(asset_name)


def _deserialize(data):
    return json.loads(data.decode('utf-8'))


def _serialize(data):
    return json.dumps(data, sort_keys=True).encode('utf-8')


class CarsState(object):

    TIMEOUT = 3

    def __init__(self, context):
        self._context = context

    def get_asset(self, asset):
        return self._get_state(_get_asset_address(asset))

    # def get_transfer(self, asset):
    #     return self._get_state(_get_transfer_address(asset))

    def set_asset(self, asset, signer):
        address = _get_asset_address(asset)
        state_data = _serialize(
            {
                "asset": asset,
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


    def delete_asset(self, asset):
        return self._context.delete_state(
            [_get_asset_address(asset)],
            timeout=self.TIMEOUT)

    def _get_state(self, address):
        state_entries = self._context.get_state(
            [address], timeout=self.TIMEOUT)
        if state_entries:
            entry = _deserialize(data=state_entries[0].data)
        else:
            entry = None
        return entry