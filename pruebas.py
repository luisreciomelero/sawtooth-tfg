import hashlib
USERCHAIN_NAMESPACE = hashlib.sha512(
    'cars-chain'.encode('utf-8')).hexdigest()[0:6]

print(USERCHAIN_NAMESPACE)