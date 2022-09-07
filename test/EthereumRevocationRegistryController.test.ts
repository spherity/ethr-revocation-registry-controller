import {RevocationRegistry} from "@spherity/ethr-revocation-registry/types/ethers-contracts";
import {
  EthereumRevocationRegistryController,
  RevocationKeyInstruction,
  RevocationKeyPath,
  RevocationListPath
} from "../src";
import {Signer} from "@ethersproject/abstract-signer";
import web3 from "web3";

jest.setTimeout(30000)

const validAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

describe('EthrRevocationRegistryController', () => {
  let registry: EthereumRevocationRegistryController;
  const registryContractMock = {
    isRevoked: jest.fn(),
    changeStatus: jest.fn(),
    changeStatusDelegated: jest.fn(),
    changeStatusesInList: jest.fn()
  } as unknown as RevocationRegistry;

  const signerMock = {

  } as unknown as Signer;
  const addressMock = "";

  beforeAll(async () => {
    registry = new EthereumRevocationRegistryController({contract: registryContractMock, signer: signerMock, address: addressMock});
  })

  afterEach(async () => {
    jest.resetAllMocks();
  })

  describe('changeStatus input verification', () => {
    it('should let valid parameters pass', async () => {
      const revocationStatus: boolean = true;
      const revocationKeyPath: RevocationKeyPath = {
        namespace: validAddress,
        list: web3.utils.keccak256("listname"),
        revocationKey: web3.utils.keccak256("revocationKey")
      }
      expect(registry.changeStatus(revocationStatus, revocationKeyPath)).resolves;
      expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(1);
      expect(registryContractMock.changeStatus).toHaveBeenCalledWith(revocationStatus, revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey);
    })
    describe('namespace in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: "",
          list: web3.utils.keccak256("listname"),
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid address', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: web3.utils.keccak256("invalidaddress"),
          list: web3.utils.keccak256("listname"),
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
    })
    describe('for list in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: "",
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: validAddress,
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
    })
    describe('for revocationKey in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
          revocationKey: ""
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
          revocationKey: validAddress
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
    })
  })

  describe('changeStatusDelegated input verification', () => {
    it('should let valid parameters pass', async () => {
      const revocationStatus: boolean = true;
      const revocationKeyPath: RevocationKeyPath = {
        namespace: validAddress,
        list: web3.utils.keccak256("listname"),
        revocationKey: web3.utils.keccak256("revocationKey")
      }
      expect(registry.changeStatusDelegated(revocationStatus, revocationKeyPath)).resolves;
      expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledTimes(1);
      expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledWith(revocationStatus, revocationKeyPath.namespace, revocationKeyPath.list, revocationKeyPath.revocationKey);
    })
    describe('namespace in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: "",
          list: web3.utils.keccak256("listname"),
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatusDelegated(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid address', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: web3.utils.keccak256("invalidaddress"),
          list: web3.utils.keccak256("listname"),
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatusDelegated(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledTimes(0);
      })
    })
    describe('for list in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: "",
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatusDelegated(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: validAddress,
          revocationKey: web3.utils.keccak256("revocationKey")
        }
        expect(registry.changeStatusDelegated(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledTimes(0);
      })
    })
    describe('for revocationKey in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
          revocationKey: ""
        }
        expect(registry.changeStatus(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatus).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationKeyPath: RevocationKeyPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
          revocationKey: validAddress
        }
        expect(registry.changeStatusDelegated(true, revocationKeyPath)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusDelegated).toHaveBeenCalledTimes(0);
      })
    })
  })

  describe('changeStatusesInList input verification', () => {
    it('should let valid parameters pass', async () => {
      const revocationStatus: boolean = true;
      const revocationListPath: RevocationListPath = {
        namespace: validAddress,
        list: web3.utils.keccak256("listname"),
      }
      const revocationKeyInstructions: RevocationKeyInstruction[] = [
        {
          revocationKey: web3.utils.keccak256("revocationKey"),
          revoked: true
        },
        {
          revocationKey: web3.utils.keccak256("revocationKey2"),
          revoked: true
        },
      ];
      const revokedStatuses: boolean[] = [
        revocationKeyInstructions[0].revoked,
        revocationKeyInstructions[1].revoked,
      ]
      const revokationKeys: string[] = [
        revocationKeyInstructions[0].revocationKey,
        revocationKeyInstructions[1].revocationKey,
      ]
      expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).resolves;
      expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(1);
      expect(registryContractMock.changeStatusesInList).toHaveBeenCalledWith(revokedStatuses, revocationListPath.namespace, revocationListPath.list, revokationKeys);
    })
    describe('namespace in revocationListPath', () => {
      it('should notice emptiness', async () => {
        const revocationListPath: RevocationListPath = {
          namespace: "",
          list: web3.utils.keccak256("listname"),
        }
        // can be empty because the check happens before
        const revocationKeyInstructions: RevocationKeyInstruction[] = []
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid address', async () => {
        const revocationListPath: RevocationListPath = {
          namespace: web3.utils.keccak256("invalidaddress"),
          list: web3.utils.keccak256("listname"),
        }
        // can be empty because the check happens before
        const revocationKeyInstructions: RevocationKeyInstruction[] = []
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
    })
    describe('for list in revocationKeyPath', () => {
      it('should notice emptiness', async () => {
        const revocationListPath: RevocationListPath = {
          namespace: validAddress,
          list: "",
        }
        // can be empty because the check happens before
        const revocationKeyInstructions: RevocationKeyInstruction[] = []
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationListPath: RevocationListPath = {
          namespace: validAddress,
          list: validAddress,
        }
        // can be empty because the check happens before
        const revocationKeyInstructions: RevocationKeyInstruction[] = []
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
    })
    describe('for revocationKey in revocationKeyInstruction', () => {
      it('should notice emptiness', async () => {
        const revocationStatus: boolean = true;
        const revocationListPath: RevocationListPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
        }
        const revocationKeyInstructions: RevocationKeyInstruction[] = [
          {
            revocationKey: "",
            revoked: true
          },
          {
            revocationKey: web3.utils.keccak256("revocationKey2"),
            revoked: true
          },
        ];
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
      it('should notice invalid bytes32', async () => {
        const revocationStatus: boolean = true;
        const revocationListPath: RevocationListPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
        }
        const revocationKeyInstructions: RevocationKeyInstruction[] = [
          {
            revocationKey: validAddress,
            revoked: true
          } as any,
          {
            revocationKey: web3.utils.keccak256("revocationKey2"),
            revoked: true
          },
        ];
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
    })
    describe('for revoked in revocationKeyInstruction', () => {
      it('should notice emptiness', async () => {
        const revocationStatus: boolean = true;
        const revocationListPath: RevocationListPath = {
          namespace: validAddress,
          list: web3.utils.keccak256("listname"),
        }
        const revocationKeyInstructions: RevocationKeyInstruction[] = [
          {
            revocationKey: web3.utils.keccak256("revocationKey"),
            revoked: undefined
          } as any,
          {
            revocationKey: web3.utils.keccak256("revocationKey2"),
            revoked: true
          },
        ];
        expect(registry.changeStatusesInList(revocationListPath, revocationKeyInstructions)).rejects.toThrow(Error);
        expect(registryContractMock.changeStatusesInList).toHaveBeenCalledTimes(0);
      })
    })
  })
})
