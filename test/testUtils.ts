import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import ganache from 'ganache'

export function createProvider(): JsonRpcProvider {
  return new Web3Provider(
    ganache.provider({
      logging: { quiet: true },
      accounts: [
        {
          secretKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383a',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383b',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000003',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000004',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000005',
          balance: '0x1000000000000000000000',
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000006',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000007',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000008',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000009',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000a',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000b',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000c',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000d',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000e',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x000000000000000000000000000000000000000000000000000000000000000f',
          balance: `0x1000000000000000000000`,
        },
        {
          secretKey: '0x0000000000000000000000000000000000000000000000000000000000000010',
          balance: `0x1000000000000000000000`,
        },
      ],
    }) as unknown as ExternalProvider
  )
}

export async function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
export async function stopMining(provider: JsonRpcProvider): Promise<unknown> {
  return provider.send('miner_stop', [])
}
export async function startMining(provider: JsonRpcProvider): Promise<unknown> {
  return provider.send('miner_start', [1])
}

export function GetDateForTodayPlusDays(numberOfDays: number): Date {
  const currentDate = new Date();
  let expiryDateInSeconds;
  if(numberOfDays < 0) {
    expiryDateInSeconds = currentDate.getTime()-(Math.abs(numberOfDays)*24*60*60*1000)
  } else {
    expiryDateInSeconds = currentDate.getTime()+(numberOfDays*24*60*60*1000)
  }
  const expiryDate = new Date();
  expiryDate.setTime(expiryDateInSeconds);
  return expiryDate;
}

export function sleepForMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}