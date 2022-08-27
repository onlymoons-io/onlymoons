import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react'
import { useMount, usePromise, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import 'react-circular-progressbar/dist/styles.css'
import { useUtilContract } from '../contracts/Util'
import { useStakingManagerV1Contract } from '../contracts/StakingManagerV1'
import { TokenData, StakingData, StakingDataForAccount } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import { useNotifications } from '../NotificationCatcher'
import { getNativeCoin } from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import TokenInput from '../TokenInput'
import { useContractCache } from '../contracts/ContractCache'
import { useSplitStakingV1Contract } from '../contracts/SplitStakingV1'
import AddressLink from '../AddressLink'

const { Web3Provider } = providers

export interface StakingProps {
  stakingData: StakingData
  startExpanded?: boolean
  className?: string
  style?: CSSProperties
  onClaimed?: () => void
}

const Staking: React.FC<StakingProps> = ({
  stakingData,
  startExpanded = false,
  className = '',
  style = {},
  onClaimed,
}) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { getContract } = useContractCache()
  const { push: pushNotification } = useNotifications()
  const { getTokenData } = useUtilContract()
  const { contract, owner } = useStakingManagerV1Contract()
  const { setSoloStakingAddress, setLpStakingAddress } = useSplitStakingV1Contract()
  const [_stakingData, setStakingData] = useState<StakingData | undefined>(stakingData)
  const [stakingTokenData, setStakingTokenData] = useState<TokenData>()
  const [rewardsTokenData, setRewardsTokenData] = useState<TokenData>()
  const [stakingContract, setStakingContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(startExpanded)
  const [settingStakingToken, setSettingStakingToken] = useState<boolean>(false)
  const depositInputRef = useRef<HTMLInputElement>(null)
  const withdrawInputRef = useRef<HTMLInputElement>(null)
  const [depositInputValue, setDepositInputValue] = useState<string>()
  const [withdrawInputValue, setWithdrawInputValue] = useState<string>()
  const [depositApproved, setDepositApproved] = useState<boolean>(false)
  const [depositLoading, setDepositLoading] = useState<boolean>(false)
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false)
  const [stakingDataForAccount, setStakingDataForAccount] = useState<StakingDataForAccount>()
  const [paused, setPaused] = useState<boolean>(false)

  useMount(() => setStakingData(_stakingData))
  useUnmount(() => setStakingData(undefined))

  useEffect(() => {
    if (!contract || !connector || !getTokenData || !_stakingData) {
      setTokenContract(undefined)
      setStakingTokenData(undefined)
      return
    }

    mounted(connector.getProvider())
      .then((provider) =>
        setTokenContract(
          new Contract(_stakingData.stakedToken, ERC20ABI, new Web3Provider(provider, 'any').getSigner()),
        ),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })

    getTokenData(_stakingData.stakedToken).then(setStakingTokenData).catch(console.error)
  }, [mounted, contract, connector, _stakingData, getTokenData])

  useEffect(() => {
    if (!account || !tokenContract || !_stakingData || !stakingTokenData) {
      setDepositApproved(false)
      return
    }

    //
    mounted<BigNumber>(tokenContract.allowance(account, _stakingData.contractAddress))
      .then((allowance: BigNumber) => {
        setDepositApproved(allowance.gte(stakingTokenData.balance))
      })
      .catch((err: Error) => {
        console.error(err)
        setDepositApproved(false)
      })
  }, [mounted, account, tokenContract, _stakingData, stakingTokenData])

  useEffect(() => {
    if (!_stakingData) {
      setStakingContract(undefined)
      return
    }

    mounted(
      getContract(_stakingData.stakingType === 1 ? 'StakingTokenV1' : 'StakingV1', {
        address: _stakingData.contractAddress,
      }),
    )
      .then(setStakingContract)
      .catch((err: Error) => {
        console.error(err)
        setStakingContract(undefined)
      })
  }, [mounted, getContract, _stakingData])

  const updateStakingDataForAccount = useCallback(() => {
    if (!account || !stakingContract) {
      setStakingDataForAccount(undefined)
      return
    }

    mounted<StakingDataForAccount>(stakingContract.getStakingDataForAccount(account))
      .then((result: StakingDataForAccount) => {
        setStakingDataForAccount(result)
      })
      .catch((err: Error) => {
        console.error(err)
        setStakingDataForAccount(undefined)
      })
  }, [mounted, account, stakingContract])

  useEffect(updateStakingDataForAccount, [updateStakingDataForAccount])

  useEffect(() => {
    if (!account || !stakingContract) {
      return
    }

    const _stakingContract = stakingContract
    const _updateStakingDataForAccount = updateStakingDataForAccount

    // event DepositedEth(address indexed account, uint256 amount);
    // event DepositedTokens(address indexed account, uint256 amount);
    // event WithdrewTokens(address indexed account, uint256 amount);
    // event ClaimedRewards(address indexed account, uint256 amount);

    const onDepositedEth = (_account: string, amount: BigNumber) => {
      //
      console.log(`${_account} deposited ${utils.formatEther(amount)} eth`)

      _updateStakingDataForAccount()
    }

    const onDepositedTokens = (_account: string, amount: BigNumber) => {
      //
      console.log(`${_account} deposited ${utils.formatUnits(amount, 18)} ${stakingTokenData?.symbol || 'tokens'}`)

      // _updateStakingDataForAccount()
    }

    const onWithdrewTokens = (_account: string, amount: BigNumber) => {
      //
      console.log(`${_account} withdrew ${utils.formatUnits(amount, 18)} ${stakingTokenData?.symbol || 'tokens'}`)

      // _updateStakingDataForAccount()
    }

    const onClaimedRewards = (_account: string, amount: BigNumber) => {
      //
      console.log(`${_account} claimed ${utils.formatEther(amount)} ${getNativeCoin(chainId || 0)}`)

      _updateStakingDataForAccount()

      onClaimed && onClaimed()
    }

    const claimedRewardsFilter = _stakingContract.filters['ClaimedRewards'](account)

    _stakingContract.on('DepositedEth', onDepositedEth)
    _stakingContract.on('DepositedTokens', onDepositedTokens)
    _stakingContract.on('WithdrewTokens', onWithdrewTokens)
    _stakingContract.on(claimedRewardsFilter, onClaimedRewards)

    return () => {
      _stakingContract.off('DepositedEth', onDepositedEth)
      _stakingContract.off('DepositedTokens', onDepositedTokens)
      _stakingContract.off('WithdrewTokens', onWithdrewTokens)
      _stakingContract.off(claimedRewardsFilter, onClaimedRewards)
    }
  }, [account, stakingContract, chainId, updateStakingDataForAccount, onClaimed, stakingTokenData])

  // useEffect(() => {
  //   console.log('staking data for account', stakingDataForAccount)
  // }, [stakingDataForAccount])

  useEffect(() => {
    if (!account || !tokenContract || !stakingTokenData) {
      return
    }

    const _account = account
    const _tokenContract = tokenContract
    const _stakingTokenData = stakingTokenData
    const _updateStakingDataForAccount = updateStakingDataForAccount

    //
    const transferListener = (from: string, to: string, amount: BigNumber) => {
      console.log(
        `${from} transferred ${utils.formatUnits(amount, _stakingTokenData.decimals)} ${
          _stakingTokenData.symbol
        } to ${to}`,
      )

      _updateStakingDataForAccount()
    }

    const transferFromFilter = _tokenContract.filters['Transfer'](_account)
    const transferToFilter = _tokenContract.filters['Transfer'](null, _account)

    _tokenContract.on(transferFromFilter, transferListener)
    _tokenContract.on(transferToFilter, transferListener)

    return () => {
      _tokenContract.off(transferFromFilter, transferListener)
      _tokenContract.off(transferToFilter, transferListener)
    }
  }, [account, tokenContract, stakingTokenData, updateStakingDataForAccount])

  // useEffect(() => {
  //   if (!stakingContract) return

  //   const numDeposits = 300

  //   stakingContract
  //     .fakeDeposits(numDeposits)
  //     .then(() => {
  //       console.log(`ran ${numDeposits} deposits`)
  //     })
  //     .catch(console.error)
  // }, [stakingContract])

  useEffect(() => {
    if (!stakingContract) {
      setPaused(false)
      return
    }

    mounted<boolean>(stakingContract.paused())
      .then((result: boolean) => setPaused(result))
      .catch((err: Error) => {
        console.error(err)
        setPaused(false)
      })
  }, [mounted, stakingContract])

  useEffect(() => {
    setRewardsTokenData(undefined)

    if (!stakingContract || !_stakingData || !chainId || !getTokenData) return

    if (_stakingData.stakingType === 0) {
      setRewardsTokenData(getNativeCoin(chainId))
      return
    }

    mounted<string>(stakingContract.rewardsToken())
      .then((address: string) => mounted(getTokenData(address)))
      .then(setRewardsTokenData)
      .catch((err: Error) => {
        console.error(err)
      })
  }, [mounted, chainId, _stakingData, stakingContract, getTokenData])

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        //
        _stakingData ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <Title>
                  <Link to={`/staking/${chainId}/${_stakingData.id}`}>{stakingTokenData?.symbol || '...'}</Link>
                </Title>
              </div>

              {/* {owner && owner === account && (
                <DarkButton className="text-opacity-50 hover:text-opacity-100">
                  <FontAwesomeIcon icon={faEllipsisV} size="sm" fixedWidth />
                </DarkButton>
              )} */}
            </div>
          </>
        ) : (
          // _stakingData is not ready
          <></>
        )
      }
      mainContent={
        //
        _stakingData && stakingTokenData && rewardsTokenData ? (
          <>
            <div className="flex-grow flex flex-col gap-3">
              {/* <span>
                Stake {stakingTokenData?.symbol || '...'} and receive {chainId ? getNativeCoin(chainId).symbol : '...'}
              </span> */}

              <div className="flex justify-between gap-2 w-full">
                <TokenInput
                  placeholder="Tokens to deposit"
                  className="w-2/3 shrink-0"
                  tokenData={stakingTokenData}
                  maxValue={stakingTokenData.balance}
                  disabled={paused || !account}
                  inputRef={depositInputRef}
                  onChange={setDepositInputValue}
                />

                <PrimaryButton
                  className="self-end flex-grow h-11"
                  disabled={!stakingContract || !tokenContract || !depositInputValue || depositLoading}
                  onClick={async () => {
                    if (!stakingContract || !depositInputRef.current || !tokenContract) return

                    setDepositLoading(true)

                    if (!depositApproved) {
                      //
                      try {
                        const tx: any = await mounted(
                          tokenContract.approve(
                            _stakingData.contractAddress,
                            BigNumber.from(
                              '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                            ),
                          ),
                        )
                        await mounted(tx.wait())

                        setDepositApproved(true)
                      } catch (err) {
                        console.error(err)
                      }
                    } else {
                      try {
                        const tx: any = await mounted(
                          stakingContract.deposit(
                            utils.parseUnits(depositInputRef.current.value, stakingTokenData.decimals),
                          ),
                        )
                        await mounted(tx.wait())
                      } catch (err) {
                        console.error(err)
                      }
                    }

                    setDepositLoading(false)
                  }}
                >
                  {depositLoading ? (
                    <FontAwesomeIcon icon={faCircleNotch} spin={true} />
                  ) : (
                    <div className="">{depositApproved ? 'Deposit' : 'Approve'}</div>
                  )}
                </PrimaryButton>
              </div>

              <div className="flex justify-between gap-2 w-full">
                <TokenInput
                  placeholder="Tokens to withdraw"
                  className="w-2/3 shrink-0"
                  tokenData={stakingTokenData}
                  disabled={!account}
                  maxValue={stakingDataForAccount?.amount}
                  inputRef={withdrawInputRef}
                  onChange={setWithdrawInputValue}
                />

                <PrimaryButton
                  className="self-end flex-grow h-11"
                  disabled={
                    !stakingDataForAccount ||
                    !withdrawInputValue ||
                    withdrawLoading ||
                    stakingDataForAccount.amount.eq(0)
                  }
                  onClick={async () => {
                    if (!stakingContract || !withdrawInputRef.current) return

                    setWithdrawLoading(true)

                    try {
                      const tx: any = await mounted(
                        stakingContract.withdraw(
                          utils.parseUnits(withdrawInputRef.current.value, stakingTokenData.decimals),
                        ),
                      )
                      await mounted(tx.wait())
                    } catch (err) {
                      console.error(err)
                    }

                    setWithdrawLoading(false)
                  }}
                >
                  <div className="">Withdraw</div>
                </PrimaryButton>
              </div>

              <PrimaryButton
                disabled={!stakingDataForAccount || stakingDataForAccount.pendingRewards.eq(0)}
                onClick={() => {
                  if (!stakingContract) return

                  mounted(stakingContract.claim())
                    .then((tx: any) => mounted(tx.wait()))
                    .catch((err: Error) => {
                      console.error(err)
                    })
                }}
              >{`Claim ${utils.formatUnits(
                stakingDataForAccount?.pendingRewards || 0,
                rewardsTokenData.decimals || 18,
              )} ${rewardsTokenData.symbol}`}</PrimaryButton>

              {stakingContract && (
                <motion.div
                  className="flex-grow flex flex-col gap-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={detailsExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <hr className="my-1 opacity-10" />

                  <Detail
                    label="Staking contract"
                    value={
                      <AddressLink
                        internalUrl={`/staking/search/${stakingContract.address}`}
                        address={stakingContract.address}
                      />
                    }
                  />
                  <Detail
                    label={`Token (${stakingTokenData.symbol})`}
                    value={
                      <AddressLink
                        internalUrl={`/staking/search/${_stakingData.stakedToken}`}
                        address={_stakingData.stakedToken}
                      />
                      // <a
                      //   target="_blank"
                      //   rel="noopener noreferrer"
                      //   className="text-indigo-500"
                      //   href={getExplorerTokenLink(getChainId(), _stakingData.stakedToken)}
                      // >
                      //   <span>{getShortAddress(_stakingData.stakedToken)}</span>
                      //   {/* <FontAwesomeIcon className="ml-1" size="xs" icon={faExternalLinkAlt} /> */}
                      // </a>
                    }
                  />
                  <Detail
                    label="Total staked"
                    value={`${utils.commify(utils.formatUnits(_stakingData.totalStaked, _stakingData.decimals))} ${
                      stakingTokenData.symbol
                    }`}
                  />
                  <Detail
                    label="Total rewards"
                    value={`${utils.commify(utils.formatUnits(_stakingData.totalRewards, rewardsTokenData.decimals))} ${
                      rewardsTokenData.symbol
                    }`}
                  />

                  <hr className="my-1 opacity-10" />

                  <PrimaryButton
                    disabled={!account}
                    onClick={() => {
                      stakingContract && stakingContract.setAutoClaimOptOut(true)
                    }}
                  >
                    Disable auto claim
                  </PrimaryButton>

                  {owner && owner === account && (
                    <>
                      <hr className="my-1 opacity-10" />

                      <PrimaryButton
                        onClick={() => {
                          //
                          stakingContract && stakingContract.setAutoClaimEnabled(false)
                        }}
                      >
                        Disable auto claim globally
                      </PrimaryButton>

                      <div className="grid grid-cols-2 gap-2">
                        <PrimaryButton
                          disabled={settingStakingToken}
                          onClick={() => {
                            setSettingStakingToken(true)

                            setSoloStakingAddress &&
                              mounted(setSoloStakingAddress(_stakingData.contractAddress))
                                .then(() => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: `Set solo staking address to ${_stakingData.contractAddress}`,
                                      level: 'success',
                                    })
                                })
                                .catch((err) => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: err.message,
                                      level: 'error',
                                    })
                                })
                          }}
                        >
                          Set as solo
                        </PrimaryButton>

                        <PrimaryButton
                          disabled={settingStakingToken}
                          onClick={() => {
                            setSettingStakingToken(true)

                            setLpStakingAddress &&
                              mounted(setLpStakingAddress(_stakingData.contractAddress))
                                .then(() => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: `Set LP staking address to ${_stakingData.contractAddress}`,
                                      level: 'success',
                                    })
                                })
                                .catch((err) => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: err.message,
                                      level: 'error',
                                    })
                                })
                          }}
                        >
                          Set as LP
                        </PrimaryButton>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </>
        ) : (
          // _stakingData is not ready
          <></>
        )
      }
      footerContent={
        _stakingData ? (
          <div>
            <motion.div
              className="text-center cursor-pointer select-none"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: detailsExpanded ? '180deg' : 0 }}
            >
              <FontAwesomeIcon icon={faChevronDown} fixedWidth />
            </motion.div>
          </div>
        ) : // _stakingData is not ready
        undefined
      }
    />
  )
}

export default Staking
