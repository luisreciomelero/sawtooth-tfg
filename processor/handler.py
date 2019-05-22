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

from sawtooth_sdk.processor.exceptions import InvalidTransaction


from user_tp.user_payload import UserPayload
from user_tp.user_state import UserState

from cars_tp.cars_payload import CarsPayload
from cars_tp.cars_state import CarsState

from invitations_tp.invitations_payload import InvitationsPayload
from invitations_tp.invitations_state import InvitationsState

import hashlib


FAMILY_NAME_USER = 'user-chain'
NAMESPACE_USER = hashlib.sha512(FAMILY_NAME_USER.encode('utf-8')).hexdigest()[:6]

FAMILY_NAME_CARS = 'cars-chain'
NAMESPACE_CARS = hashlib.sha512(FAMILY_NAME_CARS.encode('utf-8')).hexdigest()[:6]

FAMILY_NAME_INVITATIONS = 'invitations-chain'
NAMESPACE_INVITATIONS = hashlib.sha512(FAMILY_NAME_INVITATIONS.encode('utf-8')).hexdigest()[:6]

LOGGER = logging.getLogger(__name__)

class UserTransactionHandler(TransactionHandler):

    @property
    def family_name(self):
        return FAMILY_NAME_USER

    @property
    def family_versions(self):
        return ['0.0']

    @property
    def namespaces(self):
        return [NAMESPACE_USER]



    def apply(self, transaction, context):

        

        header = transaction.header
        signer = header.signer_public_key

        payload = UserPayload(transaction.payload)
        print("PAYLOAD")
        print(payload)
        print("payload.action")
        print(payload.action)
        print("payload.asset")
        print(payload.asset)
        state = UserState(context)
        print("context")
        print(context)
        LOGGER.info('Handling transaction: %s > %s %s:: %s',
                    payload.action,
                    payload.asset,
                    '> ' + payload.owner[:8] + '... ' if payload.owner else '',
                    signer[:8] + '... ')

        if payload.action == 'register':
            _register_user(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner,
                          rol= payload.rol)
        elif payload.action == 'delete':
            _delete_user(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner,
                          rol= payload.rol)
        else:
            raise InvalidTransaction('Unhandled action: {}'.format(
                payload.action))

class CarsTransactionHandler(TransactionHandler):

    @property
    def family_name(self):
        return FAMILY_NAME_CARS

    @property
    def family_versions(self):
        return ['0.0']

    @property
    def namespaces(self):
        return [NAMESPACE_CARS]



    def apply(self, transaction, context):

        

        header = transaction.header
        signer = header.signer_public_key

        payload = CarsPayload(transaction.payload)
        print("PAYLOAD")
        print(payload)
        print("payload.action")
        print(payload.action)
        print("payload.asset")
        print(payload.asset)
        state = CarsState(context)
        print("context")
        print(context)
        LOGGER.info('Handling transaction: %s > %s %s:: %s',
                    payload.action,
                    payload.asset,
                    '> ' + payload.owner[:8] + '... ' if payload.owner else '',
                    signer[:8] + '... ')

        if payload.action == 'register':
            _register_asset(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner)
        else:
            raise InvalidTransaction('Unhandled action: {}'.format(
                payload.action))


class InvitationsTransactionHandler(TransactionHandler):

    @property
    def family_name(self):
        return FAMILY_NAME_INVITATIONS

    @property
    def family_versions(self):
        return ['0.0']

    @property
    def namespaces(self):
        return [NAMESPACE_INVITATIONS]



    def apply(self, transaction, context):

        

        header = transaction.header
        signer = header.signer_public_key

        payload = InvitationsPayload(transaction.payload)
        print("PAYLOAD")
        print(payload)
        print("payload.action")
        print(payload.action)
        print("payload.asset")
        print(payload.asset)
        print("payload.owner")
        print(payload.owner)
        state = InvitationsState(context)
        print("context")
        print(context)
        LOGGER.info('Handling transaction: %s > %s %s:: %s',
                    payload.action,
                    payload.asset,
                    '> ' + payload.owner[:8] + '... ' if payload.owner else '',
                    signer[:8] + '... ')

        if payload.action == 'register':
            _register_asset(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner,
                          action = payload.action)
        elif payload.action == 'delete':
            _delete_invitacion(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner,
                          address=payload.address)
        elif payload.action == 'assign':
            _register_asset(asset=payload.asset,
                          signer=signer,
                          state=state,
                          owner= payload.owner,
                          address=payload.address)
        
        else:
            raise InvalidTransaction('Unhandled action: {}'.format(
                payload.action))




def _register_asset(asset, signer, state, owner, action):
    print("entro en _register")
    print(asset)
    print("OWNER")
    print(owner)
    if state.get_asset(asset, owner, action) is not None:
        raise InvalidTransaction(
            'Invalid action: Asset already exists: {}'.format(asset))
    print('DIrecciones exitosas anadidas: ')
    print(state.set_asset(asset, signer, owner, action))
    state.set_asset(asset, signer, owner, action)

def _delete_asset(asset, signer, state, owner):
    print("entro en _delete_asset")
    print(asset)
    print("OWNER")
    print(owner)
    if state.get_asset(asset, owner) is None:
        raise InvalidTransaction(
            'Invalid action: Asset not exists: {}'.format(asset))
    print('DIrecciones exitosas eliminadas: ')
    print(state.delete_asset(asset, owner))
    state.delete_asset(asset, owner)


def _register_user(asset, signer, state, owner, rol):
    print("entro en _register")
    print(asset)
    print("OWNER")
    print(owner)
    if state.get_asset(asset, owner, rol) is not None:
        raise InvalidTransaction(
            'Invalid action: Asset already exists: {}'.format(asset))
    print('DIrecciones exitosas anadidas: ')
    print(state.set_asset(asset, signer, owner, rol))
    state.set_asset(asset, signer, owner, rol)

def _delete_user(asset, signer, state, owner, rol):
    print("entro en _delete_asset")
    print(asset)
    print("OWNER")
    print(owner)
    if state.get_asset(asset, owner, rol) is None:
        raise InvalidTransaction(
            'Invalid action: Asset not exists: {}'.format(asset))
    print('DIrecciones exitosas eliminadas: ')
    print(state.delete_asset(asset, owner, rol))
    state.delete_asset(asset, owner, rol)

def _delete_invitacion(asset, signer, state, owner, address):
    print("entro en _delete_invitacion")
    print(asset)
    print("OWNER")
    print(owner)
    if state.get_assetAddress(address) is None:
        raise InvalidTransaction(
            'Invalid action: Asset not exists con address: {}'.format(address))
    print('DIrecciones exitosas eliminadas: ')
    print(state.delete_asset(address))
    state.delete_asset(address)




