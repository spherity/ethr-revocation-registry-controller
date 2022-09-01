/**
 * A class that can be used to interact with the EIP-5539 contract on behalf of a local controller key-pair
 */
import {RevocationRegistry, factories} from "ethr-revocation-list/types/ethers-contracts";
import {JsonRpcProvider, Provider} from "@ethersproject/providers";
import {Signer} from "@ethersproject/abstract-signer";

export const DEFAULT_REGISTRY_ADDRESS = '0x00000000000000000000000'

export class EthereumRevocationRegistryController {
  private registry: RevocationRegistry
  private signer?: Signer
  private address: string

  constructor(
    contract?: RevocationRegistry,
    provider?: Provider,
    signer?: Signer,
    rpcUrl?: string,
    chainNameOrId = 'mainnet',
    address: string = DEFAULT_REGISTRY_ADDRESS
  ) {
    if (contract) {
      this.registry = contract
    } else if (provider || signer?.provider || rpcUrl) {
      let prov = provider || signer?.provider
      if(!prov) {
        prov = new JsonRpcProvider(rpcUrl, chainNameOrId || 'any')
      }
      this.registry = new factories.RevocationRegistry__factory()
        .attach(address || DEFAULT_REGISTRY_ADDRESS)
        .connect(prov)
    } else {
      throw new Error('Either a contract instance or a provider or rpcUrl is required to initialize!')
    }
    this.signer = signer
    this.address = address
  }

  async isRevoked(namespace: string, list: string, revocationKey: string): Promise<boolean> {
    return this.registry.isRevoked(namespace, list, revocationKey);
  }
}