import React, { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { useUnmount, useIntersection, usePromise, useMount, useInterval } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamation,
  faCheck,
  faCircleNotch,
  faExchangeAlt,
  faFileCode,
  faLock,
  faStar,
  faWrench,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import humanizeDuration from 'humanize-duration'
import { useUtilContract } from '../contracts/Util'
import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import { useModal } from '../ModalController'
import { TokenData, TokenLockData, LPLockData, NetworkData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton, Ghost as Button } from '../Button'
import Tooltip from '../Tooltip'
import TokenInput from '../TokenInput'
import TokenWithValue from '../TokenWithValue'
import {
  getShortAddress,
  timestampToDateTimeLocal,
  getNativeCoin,
  getFormattedAmount,
  getNetworkDataByChainId,
} from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { useContractCache } from '../contracts/ContractCache'
import Input from '../Input'
import ContractDetails from '../ContractDetails'
import AddressLink from '../AddressLink'
import { LockWatchlist } from './LockWatchlist'

const { Web3Provider } = providers

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  largest: 1,
  round: true,
  delimiter: '',
  spacer: '',
  units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
})

const progressStyles = buildStyles({
  pathColor: 'rgb(59, 130, 246)',
  textColor: '#222',
  trailColor: 'rgba(150,150,150,0.2)',
  strokeLinecap: 'butt',
})

const progressStylesUnlocked = buildStyles({
  pathColor: 'rgb(59, 130, 246)',
  textColor: '#222',
  trailColor: '#FCA5A5',
  strokeLinecap: 'butt',
})

export interface LockProps {
  lockId: number
}

const Lock: React.FC<LockProps> = ({ lockId }) => {
  const mounted = usePromise()
  const { isWatching, addToWatchlist, removeFromWatchlist } = useContext(LockWatchlist)
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { getTokenData } = useUtilContract()
  const { contract, getTokenLockData } = useTokenLockerManagerV1Contract()
  const { setCurrentModal } = useModal()
  const [lockData, setLockData] = useState<TokenLockData | undefined>()
  const [lockTokenData, setLockTokenData] = useState<TokenData>()
  const [lockContract, setLockContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false)
  const [extendVisible, setExtendVisible] = useState<boolean>(false)
  const [depositTokens, setDepositTokens] = useState<string>('')
  const [extendedUnlockTime, setExtendedUnlockTime] = useState<number>(0)
  const [isExtending, setIsExtending] = useState<boolean>(false)
  const [isExtendApproved, setIsExtendApproved] = useState<boolean>(false)
  const [canSubmitExtend, setCanSubmitExtend] = useState<boolean>(false)
  const [lpLockData, setLpLockData] = useState<LPLockData>()
  const [lpToken0Data, setLpToken0Data] = useState<TokenData>()
  const [lpToken1Data, setLpToken1Data] = useState<TokenData>()
  const [claimableEth, setClaimableEth] = useState<BigNumber>(BigNumber.from(0))
  const [claimableTokens, setClaimableTokens] = useState<BigNumber>(BigNumber.from(0))
  const [claimTokenAddress, setClaimTokenAddress] = useState<string>()
  const [claimTokenData, setClaimTokenData] = useState<TokenData>()
  const [claimingEth, setClaimingEth] = useState<boolean>(false)
  const [claimingTokens, setClaimingTokens] = useState<boolean>(false)
  const [checkingTokenBalance, setCheckingTokenBalance] = useState<boolean>(false)
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>()
  const [transferringOwnership, setTransferringOwnership] = useState<boolean>(false)
  const intersectionRef = useRef<HTMLDivElement>(null)
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  })
  const firstVisible = useRef<boolean>(false)
  const currentlyVisible = useRef<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [manageExpanded, setManageExpanded] = useState<boolean>(false)
  const [networkData, setNetworkData] = useState<NetworkData>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant
  const eitherConnector = typeof connector !== 'undefined' ? connector : connectorConstant

  const updateLockData = useCallback(() => {
    if (typeof lockId !== 'number' || !contract || !getTokenLockData || !currentlyVisible.current || !eitherChainId) {
      setLockData(undefined)
      return
    }

    mounted(getTokenLockData(lockId))
      .then((lockData) => setLockData(lockData))
      .catch(console.error)
  }, [mounted, contract, getTokenLockData, lockId, eitherChainId])

  useEffect(updateLockData, [updateLockData])

  useMount(updateLockData)

  useUnmount(() => {
    firstVisible.current = false
    currentlyVisible.current = false
    setLockData(undefined)
  })

  const updateIsVisible = useCallback(() => {
    currentlyVisible.current = intersection && intersection.intersectionRatio > 0 ? true : false
    setIsVisible(currentlyVisible.current)
  }, [intersection])

  useEffect(updateIsVisible, [updateIsVisible])

  useInterval(updateIsVisible, 2000)

  useEffect(() => {
    if (firstVisible.current) return

    if (isVisible) {
      firstVisible.current = true
      updateLockData()
    }
  }, [isVisible, updateLockData])

  useEffect(() => {
    lockData?.unlockTime && setExtendedUnlockTime(lockData.unlockTime)
  }, [lockData, intersection])

  useEffect(() => {
    if (!contract || !eitherConnector || !getTokenData || !lockData) {
      setTokenContract(undefined)
      setLockTokenData(undefined)
      return
    }

    mounted(eitherConnector.getProvider())
      .then((provider) =>
        setTokenContract(new Contract(lockData.token, ERC20ABI, new Web3Provider(provider, 'any').getSigner())),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })

    mounted(getTokenData(lockData.token))
      .then((result) => setLockTokenData(result))
      .catch(console.error)
  }, [mounted, contract, eitherConnector, lockData, getTokenData])

  useEffect(() => {
    if (!lockData) {
      setLockContract(undefined)
      return
    }

    mounted(getContract('TokenLockerV1', { address: lockData.contractAddress }))
      .then(setLockContract)
      .catch((err: Error) => {
        console.error(err)
        setLockContract(undefined)
      })
  }, [mounted, lockData, getContract])

  useEffect(() => {
    if (!account || !tokenContract || !lockTokenData || !lockContract || !lockData) {
      setIsExtendApproved(false)
      setCanSubmitExtend(false)
      return
    }

    if (!depositTokens || depositTokens === '' || depositTokens === '0') {
      setIsExtendApproved(true)
      setCanSubmitExtend(extendedUnlockTime > lockData.unlockTime)
      return
    } else {
      setCanSubmitExtend(true)
    }

    mounted<BigNumber>(tokenContract.allowance(account, lockContract.address))
      .then((allowance_: BigNumber) =>
        setIsExtendApproved(allowance_.gte(utils.parseUnits(depositTokens, lockTokenData.decimals))),
      )
      .catch((err: Error) => {
        console.error(err)
        setIsExtendApproved(false)
      })
  }, [
    mounted,
    account,
    lockContract,
    lockTokenData,
    isExtending,
    depositTokens,
    tokenContract,
    extendedUnlockTime,
    lockData,
  ])

  useEffect(() => {
    if (!lockContract || !lockData || !lockData.isLpToken) {
      setLpLockData(undefined)
      return
    }

    mounted<LPLockData>(lockContract.getLpData())
      .then((result: LPLockData) => setLpLockData(result))
      .catch((err: Error) => {
        // console.error(err)
        setLpLockData(undefined)
      })
  }, [mounted, lockContract, lockData])

  useEffect(() => {
    if (!lpLockData || !getTokenData || !lpLockData.hasLpData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    mounted(Promise.all([getTokenData(lpLockData.token0), getTokenData(lpLockData.token1)]))
      .then(([token0Data, token1Data]) => {
        setLpToken0Data(token0Data)
        setLpToken1Data(token1Data)
      })
      .catch((err) => {
        console.error(err)
        setLpToken0Data(undefined)
        setLpToken1Data(undefined)
      })
  }, [mounted, lpLockData, getTokenData])

  useEffect(() => {
    if (!lockContract || !account || !lockData || lockData.lockOwner !== account || !connector) {
      setClaimableEth(BigNumber.from(0))
      return
    }

    mounted(connector.getProvider())
      .then((_provider) => mounted(new Web3Provider(_provider, 'any').getBalance(lockContract.address)))
      .then(setClaimableEth)
      .catch((err: Error) => {
        console.error(err)
        setClaimableEth(BigNumber.from(0))
      })
  }, [mounted, account, lockContract, connector, lockData])

  useEffect(() => {
    if (
      !lockData ||
      !connector ||
      !claimTokenAddress ||
      claimTokenAddress === '' ||
      claimTokenAddress === lockData.token
    ) {
      setClaimableTokens(BigNumber.from(0))
      return
    }

    setCheckingTokenBalance(true)

    mounted(connector.getProvider())
      .then((provider) => new Contract(claimTokenAddress, ERC20ABI, new Web3Provider(provider, 'any')))
      .then((claimTokenContract) => mounted<BigNumber>(claimTokenContract.balanceOf(lockData.contractAddress)))
      .then(setClaimableTokens)
      .catch((err: Error) => {
        console.error(err)
      })
      .then(() => setCheckingTokenBalance(false))
  }, [mounted, lockData, connector, claimTokenAddress])

  useEffect(() => {
    if (!getTokenData || !claimTokenAddress || claimTokenAddress === '') {
      setClaimTokenData(undefined)
      return
    }

    mounted(getTokenData(claimTokenAddress))
      .then(setClaimTokenData)
      .catch((err: Error) => {
        console.error(err)
      })
  }, [mounted, getTokenData, claimTokenAddress])

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  return (
    <div ref={intersectionRef} style={{ minHeight: '360px' }}>
      {!intersection ||
        (intersection.intersectionRatio > 0 && (
          <DetailsCard
            headerContent={
              //
              lockData ? (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col overflow-hidden mr-4">
                      <Title className="flex-col">
                        <div className="self-start flex max-w-full">
                          <Link
                            to={`/locker/${networkData?.urlName || eitherChainId}/${lockId}`}
                            className="shrink whitespace-nowrap overflow-hidden flex gap-2 items-baseline"
                          >
                            <span className="overflow-hidden text-ellipsis">{lockTokenData?.name || '...'} </span>
                            {lockTokenData && <span className="text-sm">({lockTokenData.symbol || '...'})</span>}
                          </Link>
                        </div>
                      </Title>

                      <div className="text-sm">
                        Locked by{' '}
                        <AddressLink
                          className="mt-2"
                          internalUrl={`/locker/search/${lockData.createdBy}`}
                          address={lockData.createdBy}
                        />
                        {lockData.lockOwner !== lockData.createdBy && (
                          <>
                            ,{' '}
                            <span className="whitespace-nowrap">
                              owned by{' '}
                              <Link to={`/locker/search/${lockData.lockOwner}`} className="mt-2 text-indigo-500">
                                {getShortAddress(lockData.lockOwner)}
                              </Link>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className="shrink-0 cursor-default"
                      style={{ maxWidth: '64px' }}
                      data-tip={true}
                      data-for={`lock-status-${lockData.id}`}
                    >
                      <CircularProgressbar
                        value={(() => {
                          //
                          const duration = lockData.unlockTime - lockData.createdAt
                          const progress = Math.ceil(Date.now() / 1000) - lockData.createdAt

                          return 100 - (progress / duration) * 100
                        })()}
                        styles={
                          BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) &&
                          !lockData.balance.eq(0)
                            ? progressStylesUnlocked
                            : progressStyles
                        }
                        children={
                          BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) ? (
                            <FontAwesomeIcon
                              className={`text-2xl ${
                                lockData.balance.eq(0) ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                              icon={lockData.balance.eq(0) ? faCheck : faExclamation}
                              fixedWidth
                            />
                          ) : (
                            <span>
                              {shortEnglishHumanizer(
                                BigNumber.from(lockData.unlockTime)
                                  .sub(BigNumber.from(Math.ceil(Date.now() / 1000)))
                                  .mul(1000)
                                  .toNumber(),
                              )}
                            </span>
                          )
                        }
                      />
                    </div>

                    <Tooltip id={`lock-status-${lockData.id}`}>
                      {lockData.unlockTime > Date.now() / 1000
                        ? 'Locked'
                        : lockData.balance.gt(0)
                        ? 'Unlocked!'
                        : 'Empty'}
                    </Tooltip>
                  </div>

                  {/* <Detail
                    label={`${lockTokenData?.symbol || 'Tokens'} locked`}
                    value={`${getFormattedAmount(lockData.balance, lockTokenData?.decimals)} (${utils.formatUnits(
                      lockData.balance.mul(10000).div(lockData.totalSupply),
                      2,
                    )}%)`}
                  /> */}

                  <div className="mt-4 pt-4 border-t dark:border-gray-800 text-center text-2xl">
                    <FontAwesomeIcon
                      className="mr-1"
                      icon={BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) ? faLockOpen : faLock}
                      opacity={0.3}
                      fixedWidth
                    />
                    {getFormattedAmount(lockData.balance, lockTokenData?.decimals)} (
                    {utils.formatUnits(lockData.balance.mul(10000).div(lockData.totalSupply), 2)}%)
                  </div>

                  {lpToken0Data && lpToken1Data && (
                    <motion.div
                      className="px-4 pt-3 mt-4 grid grid-cols-3 items-center border-t dark:border-gray-800 text-sm font-extralight"
                      initial={{ scaleY: 0, y: '-100%', opacity: 0 }}
                      animate={{ scaleY: 1, y: 0, opacity: 1 }}
                    >
                      <div className="flex flex-col justify-center items-center">
                        <AddressLink
                          className="text-lg"
                          internalUrl={`/locker/search/${lpToken0Data.address}`}
                          address={lpToken0Data.address}
                          linkText={lpToken0Data.symbol}
                          showContractIcon={false}
                        />

                        <TokenWithValue
                          amount={(() => {
                            if (!lpLockData || !lockTokenData) {
                              return BigNumber.from(0)
                            }
                            let val: BigNumber

                            try {
                              val = lpLockData.balance0
                                .mul(BigNumber.from(10).pow(lpToken0Data.decimals))
                                .div(
                                  lockData.totalSupply
                                    .mul(BigNumber.from(10).pow(lpToken0Data.decimals))
                                    .div(lockData.balance),
                                )
                            } catch (err) {
                              val = BigNumber.from(0)
                            }

                            return val
                          })()}
                          tokenData={lpToken0Data}
                          showSymbol={false}
                        />
                      </div>

                      <FontAwesomeIcon className="m-auto" icon={faExchangeAlt} fixedWidth size="1x" opacity={0.5} />

                      <div className="flex flex-col justify-center items-center">
                        <AddressLink
                          className="text-lg"
                          internalUrl={`/locker/search/${lpToken1Data.address}`}
                          address={lpToken1Data.address}
                          linkText={lpToken1Data.symbol}
                          showContractIcon={false}
                        />

                        <TokenWithValue
                          amount={(() => {
                            if (!lpLockData || !lockTokenData) {
                              return BigNumber.from(0)
                            }
                            let val: BigNumber

                            try {
                              val = lpLockData.balance1
                                .mul(BigNumber.from(10).pow(lpToken1Data.decimals))
                                .div(
                                  lockData.totalSupply
                                    .mul(BigNumber.from(10).pow(lpToken1Data.decimals))
                                    .div(lockData.balance),
                                )
                            } catch (err) {
                              val = BigNumber.from(0)
                            }

                            return val
                          })()}
                          tokenData={lpToken1Data}
                          showSymbol={false}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                // lockData is not ready
                <>
                  <Title>...</Title>
                </>
              )
            }
            mainContent={
              //
              lockData ? (
                <>
                  <div className="flex-grow flex flex-col gap-2">
                    <div className=" flex-col gap-2">
                      <Detail
                        label="Lock address"
                        value={
                          <AddressLink
                            internalUrl={`/locker/search/${lockData.contractAddress}`}
                            address={lockData.contractAddress}
                            definitelyContract={true}
                          />
                        }
                      />
                      <Detail
                        label={`${lockTokenData?.symbol || '...'} address`}
                        value={
                          <AddressLink
                            internalUrl={`/locker/search/${lockData.token}`}
                            address={lockData.token}
                            definitelyContract={true}
                          />
                        }
                      />

                      {/* <Detail
                      label={`${lockTokenData?.symbol || 'Tokens'} locked`}
                      value={`${getFormattedAmount(lockData.balance, lockTokenData?.decimals)} (${utils.formatUnits(
                        lockData.balance.mul(10000).div(lockData.totalSupply),
                        2,
                      )}%)`}
                    /> */}

                      <Detail label="Locked at" value={new Date(lockData.createdAt * 1000).toLocaleString()} />
                      <Detail
                        label={lockData.unlockTime > Date.now() / 1000 ? 'Unlocks at' : `Unlocked at`}
                        value={new Date(lockData.unlockTime * 1000).toLocaleString()}
                      />

                      {/* <section className="mt-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            lockContract &&
                              setCurrentModal(
                                <ContractDetails
                                  address={lockContract.address}
                                  abi={lockContract.interface.format('json') as string}
                                />,
                              )
                          }}
                        >
                          <FontAwesomeIcon icon={faFileCode} fixedWidth />{' '}
                          <span className="text-indigo-600 dark:text-indigo-400 ">More contract details</span>
                        </span>
                      </section> */}
                    </div>

                    <div className="flex justify-between items-center border-t dark:border-gray-700 pt-2 mt-1">
                      <div className="flex items-center gap-2">
                        <>
                          <Button
                            data-tip={true}
                            data-for={`more-contract-details-tooltip-${lockData.id}`}
                            onClick={() => {
                              lockContract &&
                                setCurrentModal(
                                  <ContractDetails
                                    address={lockContract.address}
                                    abi={lockContract.interface.format('json') as string}
                                  />,
                                )
                            }}
                          >
                            <FontAwesomeIcon icon={faFileCode} fixedWidth />
                          </Button>

                          <Tooltip place="bottom" id={`more-contract-details-tooltip-${lockData.id}`}>
                            More contract details
                          </Tooltip>
                        </>

                        <>
                          <Button
                            data-tip={true}
                            data-for={`watchlist-tooltip-${lockData.id}`}
                            onClick={() =>
                              lockData && isWatching && addToWatchlist && removeFromWatchlist
                                ? isWatching(lockData.id)
                                  ? removeFromWatchlist(lockData.id)
                                  : addToWatchlist(lockData.id)
                                : undefined
                            }
                          >
                            <FontAwesomeIcon
                              icon={isWatching && isWatching(lockData.id) ? faStar : faStarOutline}
                              fixedWidth
                            />
                          </Button>

                          <Tooltip place="bottom" id={`watchlist-tooltip-${lockData.id}`}>
                            {isWatching && isWatching(lockData.id) ? 'Remove from ' : 'Add to '}watchlist
                          </Tooltip>
                        </>
                      </div>

                      <div className="flex items-center gap-2">
                        {lockData.lockOwner === account ? (
                          <>
                            <Button onClick={() => setManageExpanded(!manageExpanded)}>
                              <FontAwesomeIcon icon={faWrench} fixedWidth /> <span className="ml-1 ">Manage</span>
                            </Button>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faCircleNotch} spin={true} opacity={0.5} size="4x" />
                  </div>
                </>
              )
            }
            footerContent={
              lockData ? (
                lockData.lockOwner === account && lockContract && manageExpanded ? (
                  <>
                    <section className="text-gray-100 grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                      <PrimaryButton className="flex-grow" onClick={() => setExtendVisible(!extendVisible)}>
                        Extend / Deposit
                      </PrimaryButton>
                      <PrimaryButton
                        className="flex-grow relative flex justify-center items-center"
                        disabled={
                          isWithdrawing ||
                          lockData.balance.eq(0) ||
                          BigNumber.from(lockData.unlockTime).gt(BigNumber.from(Math.ceil(Date.now() / 1000)))
                        }
                        onClick={() => {
                          //
                          setIsWithdrawing(true)
                          mounted(lockContract.withdraw())
                            .then((tx: any) => mounted(tx.wait()))
                            .then(() => {
                              updateLockData()
                              setIsWithdrawing(false)
                            })
                            .catch((err: Error) => {
                              console.error(err)
                              setIsWithdrawing(false)
                            })
                        }}
                      >
                        <span className={isWithdrawing ? 'invisible' : ''}>Withdraw</span>
                        <FontAwesomeIcon
                          className={isWithdrawing ? 'absolute' : 'hidden'}
                          icon={faCircleNotch}
                          fixedWidth
                          spin
                        />
                      </PrimaryButton>
                    </section>

                    {extendVisible && lockContract && lockData && lockTokenData && (
                      <section className="flex flex-col gap-2 mt-4">
                        <TokenInput
                          tokenData={lockTokenData}
                          placeholder="Tokens to add (optional)"
                          onChange={(value) => setDepositTokens(value)}
                        />

                        <div className="flex bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded items-center">
                          <div className="p-3 shrink-0">Unlock time</div>
                          <input
                            type="datetime-local"
                            className="flex-grow p-3 outline-none bg-white dark:bg-gray-700 rounded-r"
                            defaultValue={timestampToDateTimeLocal(lockData.unlockTime)}
                            onInput={(e) =>
                              setExtendedUnlockTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))
                            }
                          />
                        </div>

                        <PrimaryButton
                          disabled={!canSubmitExtend || isExtending}
                          onClick={() => {
                            if (isExtendApproved) {
                              setIsExtending(true)
                              mounted(
                                lockContract.deposit(
                                  utils.parseUnits(depositTokens || '0', lockTokenData.decimals),
                                  extendedUnlockTime,
                                ),
                              )
                                .then((tx: any) => mounted(tx.wait()))
                                .then(() => {
                                  setIsExtending(false)
                                  updateLockData()
                                  setExtendVisible(false)
                                })
                                .catch((err: Error) => {
                                  console.error(err)
                                  setIsExtending(false)
                                })
                            } else if (tokenContract && lockContract && lockTokenData) {
                              setIsExtending(true)
                              mounted(
                                tokenContract.approve(
                                  lockContract.address,
                                  utils.parseUnits(depositTokens, lockTokenData.decimals),
                                ),
                              )
                                .then((tx: any) => mounted(tx.wait()))
                                .then(() => {
                                  setIsExtendApproved(true)
                                  setIsExtending(false)
                                })
                                .catch((err: Error) => {
                                  console.error(err)
                                  setIsExtending(false)
                                })
                            }
                          }}
                        >
                          {isExtending ? (
                            <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" />
                          ) : isExtendApproved ? (
                            'Submit'
                          ) : (
                            'Approve'
                          )}
                        </PrimaryButton>
                      </section>
                    )}

                    {!claimableEth.eq(0) && (
                      <section className="mt-4">
                        <PrimaryButton
                          disabled={claimingEth}
                          className="w-full"
                          onClick={async () => {
                            setClaimingEth(true)

                            try {
                              await mounted((await mounted<any>(lockContract.withdrawEth())).wait())
                              setClaimableEth(BigNumber.from(0))
                            } catch (err) {
                              console.error(err)
                            }

                            setClaimingEth(false)
                          }}
                        >
                          Claim {utils.commify(utils.formatEther(claimableEth))}{' '}
                          {getNativeCoin(eitherChainId || 0).symbol}
                        </PrimaryButton>
                      </section>
                    )}

                    <section className="mt-4">
                      <div className="flex gap-2 mt-1 items-center">
                        <Input
                          className="flex-grow"
                          placeholder="Claim token by address"
                          onChange={(e) => {
                            setClaimTokenAddress(
                              e.currentTarget.value &&
                                e.currentTarget.value !== '' &&
                                utils.isAddress(e.currentTarget.value)
                                ? utils.getAddress(e.currentTarget.value)
                                : undefined,
                            )
                          }}
                        />

                        <FontAwesomeIcon
                          icon={faCircleNotch}
                          spin={checkingTokenBalance}
                          className={`transition-all ${
                            claimTokenData && !checkingTokenBalance
                              ? claimTokenData.address === lockData.token || claimableTokens.eq(0)
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-green-500 dark:text-green-400'
                              : ''
                          }`}
                          fixedWidth
                          opacity={checkingTokenBalance || claimTokenData ? 1 : 0.25}
                        />
                      </div>

                      {claimTokenData && !claimableTokens.eq(0) && (
                        <PrimaryButton
                          className="block w-full mt-2"
                          disabled={claimingTokens}
                          onClick={async () => {
                            setClaimingTokens(true)

                            try {
                              await mounted(
                                (await mounted<any>(lockContract.withdrawToken(claimTokenData.address))).wait(),
                              )
                              setClaimableTokens(BigNumber.from(0))
                            } catch (err) {
                              console.error(err)
                            }

                            setClaimingTokens(false)
                          }}
                        >
                          Claim {utils.commify(utils.formatUnits(claimableTokens, claimTokenData.decimals))}{' '}
                          {claimTokenData.symbol}
                        </PrimaryButton>
                      )}
                    </section>

                    <section className="mt-4 flex items-center">
                      <Input
                        className="flex-grow rounded-r-none"
                        placeholder="New owner address"
                        onChange={(e) => {
                          setNewOwnerAddress(e.currentTarget.value)
                        }}
                      />
                      <PrimaryButton
                        className="rounded-l-none"
                        disabled={transferringOwnership || !newOwnerAddress || !utils.isAddress(newOwnerAddress)}
                        onClick={async () => {
                          if (!newOwnerAddress) return

                          setTransferringOwnership(true)

                          try {
                            await mounted(
                              (
                                await mounted<any>(lockContract.transferOwnership(utils.getAddress(newOwnerAddress)))
                              ).wait(),
                            )
                          } catch (err) {
                            console.error(err)
                          }

                          setTransferringOwnership(false)
                        }}
                      >
                        Transfer
                      </PrimaryButton>
                    </section>
                  </>
                ) : undefined
              ) : // lockData is not ready
              undefined
            }
          />
        ))}
    </div>
  )
}

export default Lock
