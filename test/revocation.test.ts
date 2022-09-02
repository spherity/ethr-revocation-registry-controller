import { createProvider, sleep, startMining, stopMining } from './testUtils'
import {RevocationRegistry, factories} from "ethr-revocation-list/types/ethers-contracts";
import {EthereumRevocationRegistryController} from "../src";

jest.setTimeout(30000)

describe('EthrRevocationRegistryController', () => {
  let registry: RevocationRegistry
  let controller: EthereumRevocationRegistryController
  let accounts: string[]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  const web3Provider = createProvider()

  beforeAll(async () => {
    const factory = new factories.RevocationRegistry__factory().connect(web3Provider.getSigner(0))
    registry = await factory.deploy()
    registry = await registry.deployed()

    await registry.deployTransaction.wait()
    accounts = await web3Provider.listAccounts()

    controller = new EthereumRevocationRegistryController(registry, web3Provider)
  })

  it('checks revocation status for default namespaces', async () => {
    await expect(controller.isRevoked(accounts[0], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[1], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[2], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[3], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[4], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[5], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[6], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[7], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[8], list, revocationKey)).resolves.toEqual(false)
    await expect(controller.isRevoked(accounts[9], list, revocationKey)).resolves.toEqual(false)
  })

  it('revokes key and then unrevokes it', async () => {
    await expect(controller.isRevoked(accounts[0], list, revocationKey)).resolves.toEqual(false)
    await controller.changeStatus(true, accounts[0], list, revocationKey)
    await expect(controller.isRevoked(accounts[0], list, revocationKey)).resolves.toEqual(true)
    await controller.changeStatus(false, accounts[0], list, revocationKey)
    await expect(controller.isRevoked(accounts[0], list, revocationKey)).resolves.toEqual(false)
  })

})
