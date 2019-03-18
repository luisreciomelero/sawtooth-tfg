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

from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InternalError


from counter_tp.counter_payload import CounterPayload
from counter_tp.counter_state import CounterState

import hashlib


FAMILY_NAME = 'counter-chain'
NAMESPACE = hashlib.sha512(FAMILY_NAME.encode('utf-8')).hexdigest()[:6]


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
        state = CounterState(context)

        LOGGER.info('Handling transaction: %s > %s %s:: %s',
                    payload.action,
                    payload.asset)

        if payload.action == 'register':
            _register_asset(asset=payload.asset,
                          signer=signer,
                          state=state)

    def _register_asset(asset, signer, state):
        if state.get_asset(asset) is not None:
            raise InvalidTransaction(
                'Invalid action: Asset already exists: {}'.format(asset))
        state.set_asset(asset, signer)



