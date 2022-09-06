/**
 * A class that can be used to interact with the EIP-5539 contract on behalf of a local controller key-pair
 */
import {RevocationRegistry, factories} from "@spherity/ethr-revocation-registry/types/ethers-contracts";
import {JsonRpcProvider, Provider} from "@ethersproject/providers";
import {Signer} from "@ethersproject/abstract-signer";
import {ContractTransaction} from "@ethersproject/contracts";
import web3 from "web3";

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
    chainNameOrId = "mainnet",
    address: string = DEFAULT_REGISTRY_ADDRESS
  ) {
    if (contract) {
      this.registry = contract
    } else if (provider || signer?.provider || rpcUrl) {
      let prov = provider || signer?.provider
      if(!prov && rpcUrl) {
        prov = new JsonRpcProvider(rpcUrl, chainNameOrId || 'any')
      } else {
        throw new Error("Provider and/org rpcUrl required if contract isn't specified!")
      }
      this.validateAddress(address);
      this.registry = new factories.RevocationRegistry__factory()
        .attach(address || DEFAULT_REGISTRY_ADDRESS)
        .connect(prov)
    } else {
      throw new Error("Either a contract instance or a provider or rpcUrl is required to initialize!")
    }
    this.signer = signer
    this.address = address
  }

  private validateAddress(address: string) {
    if(!web3.utils.isAddress(address)) {
      throw new Error(`Supplied address '${address}' is not valid (notice: must start with 0x prefix; must contain only HEX character set; must have a length of 42)`)
    }
  }

  private validateBytes32(bytes32String: string) {
    if(!web3.utils.isHexStrict(bytes32String)) {
      throw new Error(`Supplied bytes32 string '${bytes32String}' is not valid (notice: must start with 0x prefix; must contain only HEX character set)`)
    }
    if(bytes32String.length !== 66) {
      throw new Error(`Supplied bytes32 string '${bytes32String}' has wrong length of '${bytes32String.length}' instead of '66'.`)
    }
  }

  private validateFullRevocationPath(revocationPath: RevocationPathDto) {
    if(!revocationPath) {
      throw new Error(`revocationPath must not be null`)
    }
    this.validateAddress(revocationPath.namespace);
    this.validateBytes32(revocationPath.list);
    this.validateBytes32(revocationPath.revocationKey);
  }

  private validatePartialRevocationPath(revocationPath: Omit<RevocationPathDto, "revocationKey">) {
    if(!revocationPath) {
      throw new Error(`revocationPath must not be null`)
    }
    this.validateAddress(revocationPath.namespace);
    this.validateBytes32(revocationPath.list);
  }

  async isRevoked(revocationPath: RevocationPathDto): Promise<boolean> {
    this.validateFullRevocationPath(revocationPath);
    return this.registry.isRevoked(revocationPath.namespace, revocationPath.list, revocationPath.revocationKey);
  }

  async changeStatus(revoked: boolean, revocationPath: RevocationPathDto): Promise<ContractTransaction> {
    this.validateFullRevocationPath(revocationPath);
    return this.registry.changeStatus(revoked, revocationPath.namespace, revocationPath.list, revocationPath.revocationKey);
  }

  async changeStatusDelegated(revoked: boolean, revocationPath: RevocationPathDto): Promise<ContractTransaction> {
    this.validateFullRevocationPath(revocationPath);
    return this.registry.changeStatusDelegated(revoked, revocationPath.namespace,  revocationPath.list, revocationPath.revocationKey);
  }


  async changeStatusInList(revocationPath: Omit<RevocationPathDto, "revocationKey">, revocationKeyStatuses: RevocationKeyStatusDto[]): Promise<ContractTransaction> {
    this.validatePartialRevocationPath(revocationPath);
    let revocationKeys: string[] = [];
    let revokedStatuses: boolean[] = [];
    revocationKeyStatuses.forEach((revocationKeyStatus) => {
      if(!revocationKeyStatus.revocationKey || !revocationKeyStatus.revoked) {
        throw new Error(`revocationKey & revoked must not be null!`)
      }
      revocationKeys.push(revocationKeyStatus.revocationKey);
      revokedStatuses.push(revocationKeyStatus.revoked);
    })
    return this.registry.changeStatusesInList(revokedStatuses, revocationPath.namespace, revocationPath.list, revocationKeys);
  }
}