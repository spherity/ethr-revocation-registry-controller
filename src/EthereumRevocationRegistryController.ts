/**
 * A class that can be used to interact with the EIP-5539 contract on behalf of a local controller key-pair
 */
import {RevocationRegistry, factories} from "@spherity/ethr-revocation-registry/types/ethers-v5";
import {BlockTag, JsonRpcProvider, Provider} from "@ethersproject/providers";
import {Signer} from "@ethersproject/abstract-signer";
import {ContractTransaction} from "@ethersproject/contracts";
import web3 from "web3";
import {RevocationListPath} from "./types/RevocationListPath";
import {RevocationKeyInstruction} from "./types/RevocationKeyInstruction";
import {RevocationKeyPath} from "./types/RevocationKeyPath";
import {isEmpty} from "lodash";
import {Block} from "@ethersproject/abstract-provider";
import {TypedEvent} from "@spherity/ethr-revocation-registry/types/ethers-v5/common";

export const DEFAULT_REGISTRY_ADDRESS = '0x00000000000000000000000'

type TimestampedEvent = TypedEvent & {
  timestamp: number
}

export interface EthereumRevocationRegistryControllerConfig {
  contract?: RevocationRegistry,
  provider?: Provider,
  signer?: Signer,
  rpcUrl?: string,
  chainNameOrId?: string,
  address?: string;
}

export interface IsRevokedOptions {
  timestamp?: Date,
  blockTag?: BlockTag
}

export class EthereumRevocationRegistryController {
  private registry: RevocationRegistry
  private signer?: Signer
  private address: string

  constructor(config: EthereumRevocationRegistryControllerConfig) {
    const address = config.address !== undefined ? config.address : DEFAULT_REGISTRY_ADDRESS;
    if (config.contract) {
      this.registry = config.contract
    } else if (config.provider || config.signer?.provider || config.rpcUrl) {
      let prov = config.provider || config.signer?.provider
      if(!prov && config.rpcUrl) {
        prov = new JsonRpcProvider(config.rpcUrl, config.chainNameOrId || 'any')
      }
      if (!prov && !config.rpcUrl) {
        throw new Error("Provider and/org rpcUrl required if contract isn't specified!")
      }
      this.validateAddress(address);
      this.registry = new factories.RevocationRegistry__factory()
        .attach(address || DEFAULT_REGISTRY_ADDRESS)
        .connect(prov!)
    } else {
      throw new Error("Either a contract instance or a provider or rpcUrl is required to initialize!")
    }
    this.signer = config.signer
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

  private async getTimestampedEventsUntilDate(events: Array<TypedEvent>, timestamp: Date): Promise<Array<TimestampedEvent>> {
    const timestampSeconds = Math.floor(timestamp.getTime()/1000);
    let timestampedEvents = await Promise.all(events.map(async (event) => {
      const block: Block = await event.getBlock()
      if(block.timestamp <= timestampSeconds) {
        return {...event, ...{timestamp: block.timestamp}}
      }
    }))
    // remove unwanted undefined entries in array due to map usage
    timestampedEvents = timestampedEvents.filter(item => item !== undefined)
    // @ts-ignore
    return this.sortByDateDescending(timestampedEvents)
  }

  private sortByDateDescending(events: Array<TypedEvent & {timestamp: number}>): Array<TimestampedEvent> {
    return events.sort(
        (eventA, eventB) => Number(eventB.timestamp) - Number(eventA.timestamp),
    )
  }

  private async getKeyRevocationStateAtDate(revocationKeyPath: RevocationKeyPath, timestamp: Date): Promise<boolean> {
    let queryFilterReturnValues;
    try {
      queryFilterReturnValues = await Promise.all([
        this.registry.queryFilter(this.registry.filters.ListStatusChanged()),
        this.registry.queryFilter(this.registry.filters.RevocationStatusChanged()),
      ]);
    } catch(error) {
      throw new Error("Cannot fetch revocation state due error fetching events of contract: " + error)
    }
    const timestampedListStatusChangedEvents = await this.getTimestampedEventsUntilDate(queryFilterReturnValues[0], timestamp);
    const timestampedRevocationStatusChangedEvents = await this.getTimestampedEventsUntilDate(queryFilterReturnValues[1], timestamp);

    if(timestampedListStatusChangedEvents.length > 0) {
      return timestampedListStatusChangedEvents[0].args.revoked === true || timestampedRevocationStatusChangedEvents[0].args.revoked === true;
    }
    if(timestampedRevocationStatusChangedEvents.length > 0) {
      return timestampedRevocationStatusChangedEvents[0].args.revoked;
    }
    return false
  }

  async isRevoked(revocationKeyPath: RevocationKeyPath, options?: IsRevokedOptions): Promise<boolean> {
    this.validateRevocationKeyPath(revocationKeyPath);
    if(options && options.timestamp) {
      return this.getKeyRevocationStateAtDate(revocationKeyPath, options.timestamp);
    } else {
      let blockTag = options && options.blockTag ? options.blockTag : "latest"
      const result = await this.registry.isRevoked(revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey, {blockTag: blockTag});
      if(result === undefined) {
        throw new Error(`Revocation couldn't be fetched for ${blockTag}`)
      }
      return result;
    }
  }

  async changeStatus(revoked: boolean, revocationKeyPath: RevocationKeyPath): Promise<ContractTransaction> {
    this.validateRevocationKeyPath(revocationKeyPath);
    return this.registry.changeStatus(revoked, revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey);
  }

  async changeStatusDelegated(revoked: boolean, revocationKeyPath: RevocationKeyPath): Promise<ContractTransaction> {
    this.validateRevocationKeyPath(revocationKeyPath);
    return this.registry.changeStatusDelegated(revoked, revocationKeyPath.namespace,  revocationKeyPath.list, revocationKeyPath.revocationKey);
  }

  async changeStatusesInList(revocationListPath: RevocationListPath, revocationKeyInstructions: RevocationKeyInstruction[]): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    let revocationKeys: string[] = [];
    let revokedStatuses: boolean[] = [];
    revocationKeyInstructions.forEach((revocationKeyInstruction) => {
      if(!revocationKeyInstruction.revocationKey) {
        throw new Error(`revocationKey in RevocationKeyInstruction must not be null!`)
      }
      if(revocationKeyInstruction.revoked === undefined) {
        throw new Error(`revoked in RevocationKeyInstruction must not be null!`)
      }
      this.validateBytes32(revocationKeyInstruction.revocationKey);
      revocationKeys.push(revocationKeyInstruction.revocationKey);
      revokedStatuses.push(revocationKeyInstruction.revoked);
    })
    return this.registry.changeStatusesInList(revokedStatuses, revocationListPath.namespace, revocationListPath.list, revocationKeys);
  }

  async changeStatusesInListDelegated(revocationListPath: RevocationListPath, revocationKeyInstructions: RevocationKeyInstruction[]): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    let revocationKeys: string[] = [];
    let revokedStatuses: boolean[] = [];
    revocationKeyInstructions.forEach((revocationKeyInstruction) => {
      if(!revocationKeyInstruction.revocationKey) {
        throw new Error(`revocationKey in RevocationKeyInstruction must not be null!`)
      }
      if(revocationKeyInstruction.revoked === undefined) {
        throw new Error(`revoked in RevocationKeyInstruction must not be null!`)
      }
      this.validateBytes32(revocationKeyInstruction.revocationKey);
      revocationKeys.push(revocationKeyInstruction.revocationKey);
      revokedStatuses.push(revocationKeyInstruction.revoked);
    })
    return this.registry.changeStatusesInListDelegated(revokedStatuses, revocationListPath.namespace, revocationListPath.list, revocationKeys);
  }

  async changeListOwner(revocationListPath: RevocationListPath, newOwner: string): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    this.validateAddress(newOwner);
    return this.registry.changeListOwner(revocationListPath.namespace, newOwner, revocationListPath.list);
  }

  async addListDelegate(revocationListPath: RevocationListPath, delegate: string, expiryDate: Date): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    this.validateAddress(delegate);
    if(!expiryDate) {
      throw new Error("expiryDate must not be null")
    }
    const today = new Date(Date.now())
    if(expiryDate < today) {
      throw new Error("expiryDate must not be in the future")
    }
    const expiryDateEpochSeconds = expiryDate.getTime() / 1000;

    return this.registry.addListDelegate(revocationListPath.namespace, delegate, revocationListPath.list, expiryDateEpochSeconds);
  }

  async removeListDelegate(revocationListPath: RevocationListPath, delegate: string): Promise<ContractTransaction> {
    this.validateRevocationListPath(revocationListPath);
    this.validateAddress(delegate);

    return this.registry.removeListDelegate(revocationListPath.namespace, delegate, revocationListPath.list);
  }
}