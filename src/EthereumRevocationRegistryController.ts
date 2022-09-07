/**
 * A class that can be used to interact with the EIP-5539 contract on behalf of a local controller key-pair
 */
import {RevocationRegistry, factories} from "@spherity/ethr-revocation-registry/types/ethers-contracts";
import {JsonRpcProvider, Provider} from "@ethersproject/providers";
import {Signer} from "@ethersproject/abstract-signer";
import {ContractTransaction} from "@ethersproject/contracts";
import web3 from "web3";
import {RevocationListPath} from "./types/RevocationListPath";
import {RevocationKeyInstruction} from "./types/RevocationKeyInstruction";
import {RevocationKeyPath} from "./types/RevocationKeyPath";
import {isEmpty} from "lodash";

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

  private validateRevocationListPath(revocationListPath: RevocationListPath) {
    if(!revocationListPath) {
      throw new Error(`revocationListPath must not be null`)
    }
    if(isEmpty(revocationListPath.namespace)) {
      throw new Error(`namespace in revocationListPath must not be null`)
    }
    if(isEmpty(revocationListPath.list)) {
      throw new Error(`list in revocationListPath must not be null`)
    }

    this.validateAddress(revocationListPath.namespace);
    this.validateBytes32(revocationListPath.list);
  }

  private validateRevocationKeyPath(revocationKeyPath: RevocationKeyPath) {
    if(isEmpty(revocationKeyPath.revocationKey)) {
      throw new Error(`revocationKey in revocationKeyPath must not be null`)
    }
    this.validateRevocationListPath(revocationKeyPath)
    this.validateBytes32(revocationKeyPath.revocationKey);
  }

  async isRevoked(revocationKeyPath: RevocationKeyPath): Promise<boolean> {
    this.validateRevocationKeyPath(revocationKeyPath);
    return this.registry.isRevoked(revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey);
  }

  async changeStatus(revoked: boolean, revocationKeyPath: RevocationKeyPath): Promise<ContractTransaction> {
    this.validateRevocationKeyPath(revocationKeyPath);
    return this.registry.changeStatus(revoked, revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey);
  }

  async changeStatusDelegated(revoked: boolean, revocationKeyPath: RevocationKeyPath): Promise<ContractTransaction> {
    this.validateRevocationKeyPath(revocationKeyPath);
    return this.registry.changeStatusDelegated(revoked, revocationKeyPath.namespace,  revocationKeyPath.list, revocationKeyPath.revocationKey);
  }

  async changeStatusInList(revocationListPath: RevocationListPath, revocationKeyInstructions: RevocationKeyInstruction[]): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    let revocationKeys: string[] = [];
    let revokedStatuses: boolean[] = [];
    revocationKeyInstructions.forEach((revocationKeyInstruction) => {
      if(!revocationKeyInstruction.revocationKey || !revocationKeyInstruction.revoked) {
        throw new Error(`revocationKey & revoked in RevocationKeyInstruction must not be null!`)
      }
      revocationKeys.push(revocationKeyInstruction.revocationKey);
      revokedStatuses.push(revocationKeyInstruction.revoked);
    })
    return this.registry.changeStatusesInList(revokedStatuses, revocationListPath.namespace, revocationListPath.list, revocationKeys);
  }
}