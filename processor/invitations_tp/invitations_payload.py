import json

from sawtooth_sdk.processor.exceptions import InvalidTransaction


class InvitationsPayload(object):

    def __init__(self, payload):
        try:
            data = json.loads(payload.decode('utf-8'))
        except ValueError:
            raise InvalidTransaction("Invalid payload serialization")

        action = data.get('action')
        asset = data.get('asset')
        owner = data.get('owner')
        address = data.get('address')

        if not action:
            raise InvalidTransaction('Action is required')
        if action not in ('register','delete', 'assign'):
            raise InvalidTransaction('Invalid action: {}'.format(action))

        self._action = action
        self._asset = asset
        self._owner = owner
        self._address = address


    @property
    def action(self):
        return self._action

    @property
    def asset(self):
        return self._asset

    @property
    def owner(self):
        return self._owner

    @property
    def address(self):
        return self._address