<div align="center">
    <img src="img/logo.png" width="256"/>
</div>

<div align="center">

# Ethereum Revocation Registry Controller

#### The controller module for interacting with EIP-5539-compatible Ethereum revocation lists.

[![EIP Draft](https://img.shields.io/badge/EIP--5539-Draft-blue)](https://github.com/ethereum/EIPs/pull/5539)
[![Registry Repo](https://img.shields.io/badge/Registry--Contract-Repo-blue)](https://github.com/spherity/ethr-revocation-registry)
[![GitHub contributors](https://badgen.net/github/contributors/spherity/ethr-revocation-registry-controller)](https://GitHub.com/spherity/ethr-revocation-registry-controller/graphs/contributors/)
[![GitHub issues](https://img.shields.io/github/issues/spherity/ethr-revocation-registry-controller)](https://GitHub.com/spherity/ethr-revocation-registry-controller/issues/)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/spherity/ethr-revocation-registry-controller.svg)](https://GitHub.com/spherity/ethr-revocation-registry-controller/pull/)

</div>

## Motivation

The EIP-5539 draft proposes a new RBAC-enabled revocation registry that can be used by any valid Ethereum address to maintain a set of revocation lists. In those, arbitrary revocation keys can be marked as either revoked or not. Additionally, the registry includes a set of management features that enables owners to have features like delegates, owner changes, and meta transactions.

This repository includes a controller module for interacting with EIP-5539-compatible revocation lists. This includes managing owners, delegates, revocation lists, revocation keys, and the support for meta transactions.

## Installation
Execute this to install this dependency:
```bash
npm install --save @spherity/ethr-revocation-registry-controller
```

You can then build the controller object by instantiating it for example with a WebsocketProvider connected to Infura:

```javascript
const { ethers } = require("ethers");
const {EthereumRevocationRegistryController} = require("@spherity/ethr-revocation-registry-controller");
const {InfuraWebSocketProvider} = require('@ethersproject/providers');

const provider = new InfuraWebSocketProvider(5, "XXXXXX");
const signer = ethers.Wallet.createRandom();
const signerAndProvider = signer.connect(provider);

const config = {
  signer: signerAndProvider,
  chainId: 5,
  address: "0x534b89b798e45929A24a217d7324EAd0EAF9413E"
}

const controller = new EthereumRevocationRegistryController(config);

async function checkRevocation() {
  const date = new Date(1686386460*1000);
  console.log(`Date: ${date.toDateString()}`);

  const revoked = await controller.isRevoked({
    namespace: "0x68849D547F49f19291737bFebA5ca5a0E1e19d84",
    list: "0x1bfcc5aaebc43b53d181ad28013ffb74e750b43b5f7c3340bfe6f33ac66e3d49",
    revocationKey: "0x6c329cb9bd41aa21e38d2c1c6ca83d88b381f2dad0a489769684f4d5c575eb2b",
  });

  console.log(`Credential status is: ${revoked}`);
}
```
**Make sure to provide a TypedDataSigner if you intend to use Meta transactions (for example 'Wallet')!**

Now you're ready to interact with your revocation lists/keys!

## Development

### Test Suite

To start the test suite, you can call:

```
npm run test
```

To get a coverage report  you need to run:

```
npm run test:coverage
```
