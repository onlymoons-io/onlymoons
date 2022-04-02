import React, { useEffect, useState } from 'react'
import { usePromise } from 'react-use'
import { useWeb3React } from '@web3-react/core'
import { Card } from './styles'
import { Outer, MidSection, SectionInner } from '../Layout'
import TokenInput from '../TokenInput'
import { BigNumber, Contract, providers } from 'ethers'
import Button, { Light, Primary as PrimaryButton } from '../Button'
import { BridgeData, NetworkData, TokenData } from '../../typings'
import { useUtilContract } from '../contracts/Util'
import { getExplorerAddressLink, getNativeCoin, getNetworkDataByChainId, getShortAddress, remove0x } from '../../util'
import { utils, ContractTransaction } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  faExternalLinkAlt,
  faNetworkWired,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import bridges from '../../data/bridges'
import { useModal } from '../ModalController'
import DetailsCard from '../DetailsCard'
import Anchor from '../Anchor'
import { ERC20ABI, BridgeABI } from '../../contracts/external_contracts'
import { useCallback } from 'react'

const { commify, formatUnits, formatEther, parseUnits, parseEther, hexZeroPad } = utils

const EMPTY_TOKEN = {
  address: '',
  name: 'test',
  symbol: 'test',
  decimals: 18,
  balance: BigNumber.from(0),
}

const Bridge: React.FC = () => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { setCurrentModal } = useModal()
  const { getTokenData } = useUtilContract()
  const [bridgeTokens, setBridgeTokens] = useState<Array<TokenData>>([])
  const [bridgeData, setBridgeData] = useState<BridgeData>()
  const [bridgeTokenData, setBridgeTokenData] = useState<TokenData>()
  const [bridgeContract, setBridgeContract] = useState<Contract>()
  const [bridgeTokenContract, setBridgeTokenContract] = useState<Contract>()
  const [destinationNetwork, setDestinationNetwork] = useState<NetworkData>()
  const [bridgeAmount, setBridgeAmount] = useState<string>('0')
  const [bridgeApproved, setBridgeApproved] = useState<boolean>(false)
  const [approvingBridge, setApprovingBridge] = useState<boolean>(false)
  const [bridging, setBridging] = useState<boolean>(false)
  const [checkingApproval, setCheckingApproval] = useState<boolean>(false)
  const [bridgeFee, setBridgeFee] = useState<string>()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [bridgeBalance, setBridgeBalance] = useState<string>()

  useEffect(() => {
    setBridgeData(typeof chainId !== 'undefined' ? bridges[chainId] : undefined)
  }, [chainId])

  useEffect(() => {
    if (!bridgeContract) {
      setBridgeFee(undefined)
      return
    }

    //
    mounted<BigNumber>(bridgeContract._fee())
      .then((result) => setBridgeFee(formatEther(result)))
      .catch((err) => {
        console.error(err)
        setBridgeFee(undefined)
      })
  }, [mounted, bridgeContract])

  useEffect(() => {
    if (typeof chainId === 'undefined' || !getTokenData || !bridgeData) {
      setBridgeTokens([])
      return
    }

    //
    mounted(
      Promise.all(
        // converting to and from a set gets rid of duplicates
        Array.from(new Set(bridgeData.destinations.flatMap((destination) => Object.keys(destination.resources)))).map(
          (tokenAddress) => getTokenData(tokenAddress),
        ),
      ),
    )
      .then((results) => {
        setBridgeTokens(results.filter((v) => typeof v !== 'undefined') as Array<TokenData>)
      })
      .catch((err) => {
        console.error(err)
        setBridgeTokens([])
      })
  }, [mounted, chainId, getTokenData, bridgeData])

  useEffect(() => {
    setDestinationNetwork(undefined)
  }, [bridgeTokenData])

  useEffect(() => {
    if (!connector || !bridgeTokenData) {
      setBridgeTokenContract(undefined)
      return
    }

    mounted(connector.getProvider())
      .then((provider) => {
        setBridgeTokenContract(
          new Contract(bridgeTokenData.address, ERC20ABI, new providers.Web3Provider(provider).getSigner()),
        )
      })
      .catch((err) => {
        console.error(err)
        setBridgeTokenContract(undefined)
      })
  }, [mounted, connector, bridgeTokenData])

  const checkBridgeApproval = useCallback(async () => {
    if (!account || !bridgeData || !bridgeTokenContract || !bridgeTokenData || !bridgeAmount || !destinationNetwork) {
      setCheckingApproval(false)
      setBridgeApproved(false)
      return
    }

    setCheckingApproval(true)

    try {
      const allowance = await mounted<BigNumber>(bridgeTokenContract.allowance(account, bridgeData.erc20Handler))
      setBridgeApproved(allowance.gte(parseUnits(bridgeAmount, bridgeTokenData.decimals)))
    } catch (err) {
      console.error(err)
      setBridgeApproved(false)
    }

    setCheckingApproval(false)
  }, [mounted, account, bridgeData, bridgeTokenContract, bridgeTokenData, bridgeAmount, destinationNetwork])

  useEffect(() => {
    checkBridgeApproval().catch(console.error)
  }, [checkBridgeApproval])

  useEffect(() => {
    if (typeof chainId === 'undefined' || !bridgeData || !connector) {
      setBridgeContract(undefined)
      return
    }

    //
    mounted(connector.getProvider())
      .then((provider) => new providers.Web3Provider(provider).getSigner())
      .then((signer) => new Contract(bridgeData.bridge, BridgeABI, signer))
      .then(setBridgeContract)
      .catch((err) => {
        console.error(err)
        setBridgeContract(undefined)
      })
  }, [mounted, bridgeData, chainId, connector])

  useEffect(() => {
    if (!bridgeContract || !account) {
      setIsAdmin(false)
      return
    }

    mounted<string>(bridgeContract.DEFAULT_ADMIN_ROLE())
      .then((role) => mounted<boolean>(bridgeContract.hasRole(role, account)))
      .then(setIsAdmin)
      .catch((err) => {
        console.error(err)
        setIsAdmin(false)
      })
  }, [mounted, account, bridgeContract])

  useEffect(() => {
    if (!bridgeContract || !connector) {
      setBridgeBalance(undefined)
      return
    }

    mounted(connector.getProvider())
      .then((provider) => mounted<BigNumber>(new providers.Web3Provider(provider).getBalance(bridgeContract.address)))
      .then((balance) => setBridgeBalance(formatEther(balance)))
      .catch((err) => {
        console.error(err)
        setBridgeBalance(undefined)
      })
  }, [mounted, account, bridgeContract, connector])

  return (
    <MidSection>
      <SectionInner className="flex flex-col gap-8">
        {!chainId ||
          (!getNetworkDataByChainId(chainId)?.isTestNet && (
            <div className="bg-red-500 w-full max-w-sm rounded p-4 flex justify-center items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Currently only available on testnets, and will have intermittent outages.
            </div>
          ))}

        <Card
          headerContent={
            <span className="flex gap-2 items-center">
              <FontAwesomeIcon icon={faNetworkWired} /> From:{' '}
              <span className="font-bold">{getNetworkDataByChainId(chainId ?? 0)?.name ?? 'disconnected'}</span>
            </span>
          }
          mainContent={
            <div>
              <div className="grid gap-4">
                <PrimaryButton
                  onClick={() => {
                    setCurrentModal(
                      <DetailsCard
                        className="w-full"
                        headerContent={<span className="text-xl">Select token</span>}
                        mainContent={
                          <div>
                            {bridgeTokens.map((tokenData) => (
                              <Button
                                key={tokenData.address}
                                className="hover:bg-gray-500 hover:bg-opacity-10 rounded-none w-full flex items-center justify-between gap-2"
                                onClick={() => {
                                  setCurrentModal(null)
                                  setBridgeTokenData(tokenData)
                                }}
                              >
                                <span className="overflow-hidden overflow-ellipsis">{tokenData.name || 'ERC20'}</span>
                                <span className="overflow-hidden overflow-ellipsis">
                                  {commify(formatUnits(tokenData.balance, tokenData.decimals))}
                                </span>
                              </Button>
                            ))}
                          </div>
                        }
                      />,
                    )
                  }}
                >
                  {bridgeTokenData
                    ? `${bridgeTokenData.name || 'ERC20'} (${bridgeTokenData.symbol || 'ERC20'})`
                    : 'Select token'}
                </PrimaryButton>

                <TokenInput tokenData={bridgeTokenData || EMPTY_TOKEN} onChange={setBridgeAmount} />
              </div>
            </div>
          }
        />

        {bridgeTokenData && (
          <Card
            headerContent={
              <span className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faNetworkWired} /> To:{' '}
                <Light
                  className="font-bold grow text-left"
                  onClick={() =>
                    setCurrentModal(
                      <DetailsCard
                        className="w-full"
                        headerContent={<span className="text-xl">Select network</span>}
                        mainContent={
                          <div>
                            {bridgeData?.destinations
                              .filter((destination) => (destination.resources[bridgeTokenData.address] ? true : false))
                              .map((destination) => (
                                <Button
                                  className="hover:bg-gray-500 hover:bg-opacity-10 rounded-none w-full flex items-center gap-4"
                                  key={destination.chainId}
                                  onClick={() => {
                                    setDestinationNetwork(getNetworkDataByChainId(destination.chainId))
                                    setCurrentModal(null)
                                  }}
                                >
                                  {getNetworkDataByChainId(destination.chainId)?.name}
                                </Button>
                              ))}
                          </div>
                        }
                      />,
                    )
                  }
                >
                  {destinationNetwork?.name ?? 'Destination network'}
                </Light>
              </span>
            }
            mainContent={
              <div>
                {destinationNetwork && (
                  <div className="mb-4 flex flex-col gap-2">
                    <div>
                      <Anchor
                        target="_blank"
                        rel="noopener noreferrer"
                        href={getExplorerAddressLink(destinationNetwork?.chainId || 0, account || '')}
                        className=""
                      >
                        {getShortAddress(account || '')} <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </Anchor>{' '}
                      will receive{' '}
                      {(() => {
                        try {
                          return commify(bridgeAmount)
                        } catch (err) {
                          return '~0'
                        }
                      })()}{' '}
                      tokens
                    </div>

                    <hr className="opacity-10" />

                    <div>
                      Bridge fee:{' '}
                      {typeof bridgeFee === 'undefined' ? (
                        <>Loading...</>
                      ) : (
                        <>
                          {commify(bridgeFee)} {getNativeCoin(chainId || 0).symbol}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <PrimaryButton
                  disabled={
                    checkingApproval ||
                    approvingBridge ||
                    bridging ||
                    !destinationNetwork ||
                    !bridgeAmount ||
                    typeof bridgeFee === 'undefined' ||
                    parseUnits(bridgeAmount, bridgeTokenData.decimals).eq(0)
                  }
                  className="w-full"
                  onClick={
                    bridgeApproved
                      ? async () => {
                          if (
                            !account ||
                            !bridgeContract ||
                            !bridgeTokenData ||
                            !destinationNetwork ||
                            !bridgeData ||
                            !bridgeAmount ||
                            typeof bridgeFee === 'undefined'
                          ) {
                            setBridging(false)
                            return
                          }

                          const resource = bridgeData.destinations.find(
                            (destination) => destination.chainId === destinationNetwork.chainId,
                          )?.resources[bridgeTokenData.address]

                          if (!resource) {
                            setBridging(false)
                            return
                          }

                          setBridging(true)

                          try {
                            // submit deposit transaction to bridge
                            const tx = await mounted<ContractTransaction>(
                              bridgeContract.deposit(
                                // destination chain id
                                destinationNetwork.chainId,
                                // unique resource identifier
                                resource,
                                // format the calldata byte array using a hex string
                                // Amount	uint256	0 - 31
                                // Recipient Address Length	uint256	32 - 63
                                // Recipient Address	bytes	63 - END
                                `${hexZeroPad(
                                  parseUnits(bridgeAmount, bridgeTokenData.decimals).toHexString(),
                                  32,
                                )}${remove0x(
                                  hexZeroPad(BigNumber.from(remove0x(account).length).toHexString(), 32),
                                )}${remove0x(account)}`,
                                {
                                  value: parseEther(bridgeFee),
                                },
                              ),
                            )

                            // transaction submitted, now wait for it to be mined
                            await mounted(tx.wait())
                          } catch (err) {
                            console.error(err)
                          }

                          setBridging(false)
                        }
                      : async () => {
                          if (!bridgeTokenContract || !bridgeData) {
                            setApprovingBridge(false)
                            return
                          }

                          setApprovingBridge(true)

                          try {
                            const tx = await mounted<ContractTransaction>(
                              bridgeTokenContract.approve(
                                bridgeData.erc20Handler,
                                parseUnits(bridgeAmount, bridgeTokenData.decimals),
                              ),
                            )

                            await mounted(tx.wait())
                          } catch (err) {
                            console.error(err)
                          }

                          setApprovingBridge(false)

                          checkBridgeApproval()
                        }
                  }
                >
                  {checkingApproval ? (
                    <>
                      Checking <FontAwesomeIcon icon={faCircleNotch} spin fixedWidth />
                    </>
                  ) : approvingBridge ? (
                    <>
                      Approving <FontAwesomeIcon icon={faCircleNotch} spin fixedWidth />
                    </>
                  ) : bridging ? (
                    <>
                      Bridging <FontAwesomeIcon icon={faCircleNotch} spin fixedWidth />
                    </>
                  ) : (
                    <>{bridgeApproved ? 'Bridge' : 'Approve'}</>
                  )}
                </PrimaryButton>
              </div>
            }
          />
        )}

        {isAdmin && (
          <Card
            className="w-full"
            headerContent={<span className="text-lg">Admin</span>}
            mainContent={
              <div>
                <PrimaryButton
                  disabled={!bridgeContract || !bridgeBalance}
                  className="w-full"
                  onClick={async () => {
                    if (!account || !bridgeContract || !bridgeBalance) {
                      return
                    }

                    try {
                      const tx = await bridgeContract.transferFunds([account], [parseEther(bridgeBalance)])

                      await tx.wait()
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                >
                  Claim {commify(bridgeBalance || '0')} {getNativeCoin(chainId || 0).symbol}
                </PrimaryButton>
              </div>
            }
          />
        )}
      </SectionInner>
    </MidSection>
  )
}

const BridgeWrapper: React.FC = () => {
  const { account } = useWeb3React()

  return (
    <Outer>
      {account ? (
        <Bridge />
      ) : (
        <MidSection>
          <SectionInner className="p-8 bg-gray-500 bg-opacity-10 rounded">
            Wallet must be connected to bridge
          </SectionInner>
        </MidSection>
      )}
    </Outer>
  )
}

export default BridgeWrapper
