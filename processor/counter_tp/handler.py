# Copyright 2018 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------
import logging
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InternalError


from counter_tp.counter_payload import CounterPayload
from counter_tp.counter_state import CounterState

import hashlib


FAMILY_NAME = 'counter-chain'
NAMESPACE = hashlib.sha512(FAMILY_NAME.encode('utf-8')).hexdigest()[:6]

LOGGER = logging.getLogger(__name__)

# _SETTING_MAX_KEY_PARTS = 4
# _SETTING_ADDRESS_PART_SIZE = 16
# ALLOWED_SIGNER_SETTING = "sawtooth.identity.allowed_keys"

# def _setting_key_to_address(key):
#     key_parts = key.split('.', maxsplit=_SETTING_MAX_KEY_PARTS - 1)
#     addr_parts = [_setting_short_hash(byte_str=x.encode()) for x in key_parts]
#     addr_parts.extend(
#         [_SETTING_ADDRESS_PADDING] * (_SETTING_MAX_KEY_PARTS - len(addr_parts))
#     )
#     return _SETTING_NAMESPACE + ''.join(addr_parts)



# def _setting_short_hash(byte_str):
#      return hashlib.sha256(byte_str).hexdigest()[:_SETTING_ADDRESS_PART_SIZE]


# _SETTING_ADDRESS_PADDING = _setting_short_hash(byte_str=b'')
# ALLOWED_SIGNER_ADDRESS = _setting_key_to_address("sawtooth.identity.allowed_keys")


class CounterTransactionHandler(TransactionHandler):

    @property
    def family_name(self):
        return FAMILY_NAME

    @property
    def family_versions(self):
        return ['0.0']

    @property
    def namespaces(self):
        return [NAMESPACE]



    def apply(self, transaction, context):

        

        header = transaction.header
        signer = header.signer_public_key

        payload = CounterPayload(transaction.payload)
        print("PAYLOAD")
        print(payload)
        print("payload.action")
        print(payload.action)
        print("payload.asset")
        print(payload.asset)
        state = CounterState(context)
        print("context")
        print(context)
        LOGGER.info('Handling transaction: %s > %s %s:: %s',
                    payload.action,
                    payload.asset,
                    '> ' + payload.owner[:8] + '... ' if payload.owner else '',
                    signer[:8] + '... ')

        if payload.action == 'register':
            _register_asset(asset=payload.original_number,
                          signer=signer,
                          state=state)

        elif payload.action == 'increase':
            _increase_asset(asset=payload.asset,
                            signer=signer,
                            state=state,
                            original_number=payload.original_number)
        else:
            raise InvalidTransaction('Unhandled action: {}'.format(
                payload.action))



def _register_asset(asset, signer, state):
    print("entro en _register")
    print(asset)
    if state.get_asset(asset) is not None:
        raise InvalidTransaction(
            'Invalid action: Asset already exists: {}'.format(asset))
    print('DIrecciones exitosas anadidas: ')
    print(state.set_asset(asset, signer))
    state.set_asset(asset, signer)

def _increase_asset(asset, signer, state, original_number):
    if state.get_asset(original_number) is not None:
        raise InvalidTransaction(
            'Invalid action: Asset not exists: {}'.format(original_number))
    state.set_asset(asset, signer)
    state.delete_asset(original_number)
