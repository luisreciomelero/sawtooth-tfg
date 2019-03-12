import json

from sawtooth_sdk.processor.exceptions import InvalidTransaction


class CounterPayload(object):

    def __init__(self, payload):
        try:
            data = json.loads(payload.decode('utf-8'))
        except ValueError:
            raise InvalidTransaction("Invalid payload serialization")

        # action = data.get('action')
        # asset = data.get('asset')
        # owner = data.get('owner')

        # if not action:
        #     raise InvalidTransaction('Action is required')
        # if action not in ('create', 'transfer', 'accept', 'reject', 'edit'):
        # #if action not in ('create'):
        #     raise InvalidTransaction('Invalid action: {}'.format(action))

        # if not asset:
        #     raise InvalidTransaction('Asset is required')

        # if action == 'transfer':
        #     if not owner:
        #         raise InvalidTransaction(
        #             'Owner is required for "transfer" transaction')

        # self._action = action
        # self._asset = asset
        # self._owner = owner

    @property
    def action(self):
        return self._action

    @property
    def asset(self):
        return self._asset

    @property
    def owner(self):
        return self._owner
