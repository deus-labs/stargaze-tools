import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export type Expiration = { at_height: number } | { at_time: string } | { never: Record<string, never> }

export interface SG721Instance {
  readonly contractAddress: string

  // queries
  getOwnerOf: (tokenId: string, includeExpired: boolean | null) => Promise<any>

  getApproval: (tokenId: string, spender: string, includeExpired: boolean | null) => Promise<any>

  getApprovals: (tokenId: string, includeExpired: boolean | null) => Promise<any>

  getAllOperators: (
    owner: string,
    includeExpired: boolean | null,
    startAfter: string | null,
    limit: number | null,
  ) => Promise<any>

  getNumTokens: () => Promise<any>

  getContractInfo: () => Promise<any>

  getNftInfo: (tokenId: string) => Promise<any>

  getAllNftInfo: (tokenId: string, includeExpired: boolean | null) => Promise<any>

  getTokens: (owner: string, startAfter: string | null, limit: number | null) => Promise<any>

  getAllTokens: (startAfter: string | null, limit: number | null) => Promise<any>

  getMinter: () => Promise<any>

  getCollectionInfo: () => Promise<any>

  //Execute
  transferNft: (recipient: string, tokenId: string) => Promise<string>
  /// Send is a base message to transfer a token to a contract and trigger an action
  /// on the receiving contract.
  sendNft: (
    contract: string,
    tokenId: string,
    msg: string, //Binary
  ) => Promise<string>
  /// Allows operator to transfer / send the token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approve: (spender: string, tokenId: string, expires: Expiration | null) => Promise<string>
  /// Remove previously granted Approval
  revoke: (spender: string, tokenId: string) => Promise<string>
  /// Allows operator to transfer / send any token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approveAll: (operator: string, expires: Expiration | null) => Promise<string>
  /// Remove previously granted ApproveAll permission
  revokeAll: (operator: string) => Promise<string>
  /// Mint a new NFT, can only be called by the contract minter
  mint: (msg: string) => Promise<string> //MintMsg<T>

  /// Burn an NFT the sender has access to
  burn: (tokenId: string) => Promise<string>
}

export interface SG721Contract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => SG721Instance
}

export const SG721 = (client: SigningCosmWasmClient, txSigner: string): SG721Contract => {
  const use = (contractAddress: string): SG721Instance => {
    const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64')

    const getOwnerOf = async (tokenId: string, includeExpired: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        owner_of: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const getApproval = async (tokenId: string, spender: string, includeExpired: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approval: { token_id: tokenId, spender, include_expired: includeExpired },
      })
      return res
    }

    const getApprovals = async (tokenId: string, includeExpired: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approvals: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const getAllOperators = async (
      owner: string,
      includeExpired: boolean | null,
      startAfter: string | null,
      limit: number | null,
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_operators: { owner, include_expired: includeExpired, start_after: startAfter, limit },
      })
      return res
    }

    const getNumTokens = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        num_tokens: {},
      })
      return res
    }

    const getContractInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        contract_info: {},
      })
      return res
    }

    const getNftInfo = async (tokenId: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        nft_info: { token_id: tokenId },
      })
      return res
    }

    const getAllNftInfo = async (tokenId: string, includeExpired: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_nft_info: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const getTokens = async (owner: string, startAfter: string | null, limit: number | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        tokens: { owner, start_after: startAfter, limit },
      })
      return res
    }

    const getAllTokens = async (startAfter: string | null, limit: number | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_tokens: { start_after: startAfter, limit },
      })
      return res
    }

    const getMinter = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        minter: {},
      })
      return res
    }

    const getCollectionInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        collection_info: {},
      })
      return res
    }

    //Execute
    const transferNft = async (recipient: string, tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          transfer_nft: { recipient, token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const sendNft = async (
      contract: string,
      tokenId: string,
      msg: string, //Binary
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          send_nft: { contract, token_id: tokenId, msg: encode(msg) },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const approve = async (spender: string, tokenId: string, expires: Expiration | null): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          approve: { spender, token_id: tokenId, expires },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const revoke = async (spender: string, tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          revoke: { spender, token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const approveAll = async (operator: string, expires: Expiration | null): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          approve_all: { operator, expires },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const revokeAll = async (operator: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          revoke_all: { operator },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mint = async (msg: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          mint: { msg },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const burn = async (tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          burn: { token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    return {
      contractAddress,
      getOwnerOf,
      getApproval,
      getApprovals,
      getAllOperators,
      getNumTokens,
      getContractInfo,
      getNftInfo,
      getAllNftInfo,
      getTokens,
      getAllTokens,
      getMinter,
      getCollectionInfo,
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      burn,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto', {
      funds: [coin('1000000000', 'ustars')],
      memo: '',
      admin,
    })
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  return { use, instantiate }
}
