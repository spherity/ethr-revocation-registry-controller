import {createProvider, sleepForMs} from './testUtils'
import {RevocationRegistry, factories} from "@spherity/ethr-revocation-registry/types/ethers-v5";
import {EthereumRevocationRegistryController, RevocationKeyPath} from "../src";
import {Wallet} from "@ethersproject/wallet";

jest.setTimeout(30000)

describe('EthrRevocationRegistryController', () => {
  let registry: RevocationRegistry
  let controller: EthereumRevocationRegistryController
  let accounts: string[]
  const exampleList = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const exampleRevocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  function generateRevocationKeyPathForAccount(account: string): RevocationKeyPath {
    return {
      namespace: account,
      list: exampleList,
      revocationKey: exampleRevocationKey,
    }
  }

  const web3Provider = createProvider()

  beforeAll(async () => {
    const factory = new factories.RevocationRegistry__factory().connect(web3Provider.getSigner(0))
    registry = await factory.deploy()
    registry = await registry.deployed()

    await registry.deployTransaction.wait()

    accounts = await web3Provider.listAccounts()

    controller = new EthereumRevocationRegistryController({contract: registry, provider: web3Provider, address: registry.address})
  })

  it('checks revocation status for default namespaces', async () => {
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[1]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[2]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[3]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[4]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[5]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[6]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[7]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[8]))).resolves.toEqual(false)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[9]))).resolves.toEqual(false)
  })

  it('revokes key and then unrevokes it', async () => {
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]))).resolves.toEqual(false)
    await controller.changeStatus(true, generateRevocationKeyPathForAccount(accounts[0]))
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]))).resolves.toEqual(true)
    await controller.changeStatus(false, generateRevocationKeyPathForAccount(accounts[0]))
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]))).resolves.toEqual(false)
  })

  it('revokes key, unrevokes & checks status in the past correctly', async () => {
    await controller.changeStatus(true, generateRevocationKeyPathForAccount(accounts[0]))
    await sleepForMs(1000)
    const revokedDate = new Date()
    await sleepForMs(1000)
    await controller.changeStatus(false, generateRevocationKeyPathForAccount(accounts[0]))
    await sleepForMs(1000)
    const unrevokedDate = new Date()
    await sleepForMs(1000)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]), {timestamp: revokedDate})).resolves.toEqual(true)
    await expect(controller.isRevoked(generateRevocationKeyPathForAccount(accounts[0]), {timestamp: unrevokedDate})).resolves.toEqual(false)
  })

  describe('ChangeStatusSigned', () => {
    it('Separate signer creates a signed payload for the initial controller to send out', async () => {
      const signer = new Wallet("0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f")
      signer.connect(web3Provider)
      const typedDataSignableController = new EthereumRevocationRegistryController({
        contract: registry,
        provider: web3Provider,
        signer: signer,
        address: registry.address
      })

      const payload = await typedDataSignableController.generateChangeStatusSignedPayload(true, generateRevocationKeyPathForAccount(signer.address))
      const transaction = await controller.changeStatusSigned(payload)
      expect(transaction.wait()).resolves
      await expect(controller.isRevoked(generateRevocationKeyPathForAccount(signer.address))).resolves.toEqual(true)
    });

    it('Second execution of a signed Payload is aborted due to old nonce', async () => {
      const signer = new Wallet("0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f")
      signer.connect(web3Provider)
      const typedDataSignableController = new EthereumRevocationRegistryController({
        contract: registry,
        provider: web3Provider,
        signer: signer,
        address: registry.address
      })

      const payload1 = await typedDataSignableController.generateChangeStatusSignedPayload(true, generateRevocationKeyPathForAccount(signer.address))
      //payload.signature = "0x42226ea22060ddeda4cdae57670410ca84fc4a8fbdaf234b780460b12a8e04d706e2af7bfa43ae492e39f5a592566be3b3aae76f7cdd46183db22e162f09ac861c"
      const transaction1 = await controller.changeStatusSigned(payload1)
      expect(transaction1.wait()).resolves

      const payload2 = await typedDataSignableController.generateChangeStatusSignedPayload(false, generateRevocationKeyPathForAccount(signer.address))

      const transaction2 = await controller.changeStatusSigned(payload2)
      expect(transaction2.wait()).resolves

      expect(controller.changeStatusSigned(payload1)).rejects.toThrow(Error)
    });
  });
})
