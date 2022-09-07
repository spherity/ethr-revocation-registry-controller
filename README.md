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

You can then build the controller object by instantiating it for example with a HttpProvider connected to Infura:

```javascript
const provider = new Web3.providers.HttpProvider(
  `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
)
const signer = web3.eth.accounts.privateKeyToAccount(
  process.env.SIGNER_PRIVATE_KEY
);

const config: EthereumRevocationRegistryControllerConfig = {
  provider: infuraProvider,
  signer: signer
}

const controller = new EthereumRevocationRegistryController(config);
```
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