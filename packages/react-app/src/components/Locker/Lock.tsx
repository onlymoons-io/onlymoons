import React, { useState, useEffect, useCallback, useContext } from 'react'
import { useMount, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamation, faCheck, faCircleNotch, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import humanizeDuration from 'humanize-duration'
import { UtilContractContext } from '../contracts/Util'
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import { TokenData, TokenLockData, LPLockData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import Tooltip from '../Tooltip'
import TokenInput from '../TokenInput'
import contracts from '../../contracts/production_contracts.json'
import { getShortAddress, getExplorerContractLink, getExplorerTokenLink, timestampToDateTimeLocal } from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'

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

interface Props {
  lock: TokenLockData
}

const Lock: React.FC<Props> = ({ lock }) => {
  const { account, chainId, connector } = useWeb3React()
  const { getTokenData } = useContext(UtilContractContext)
  const { contract, getTokenLockData } = useContext(TokenLockerManagerV1ContractContext)
  const [lockData, setLockData] = useState<TokenLockData | undefined>(lock)
  const [lockTokenData, setLockTokenData] = useState<TokenData>()
  const [lockContract, setLockContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [lockAbi, setLockAbi] = useState<any>()
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

  useMount(() => setLockData(lock))

  useUnmount(() => {
    setLockData(undefined)
  })

  const getChainId = useCallback(() => {
    return chainId || 0
  }, [chainId])

  const updateLockData = useCallback(() => {
    if (!contract || !getTokenLockData) return

    getTokenLockData(lock.id)
      .then(lockData => setLockData(lockData))
      .catch(console.error)
  }, [contract, lock, getTokenLockData])

  useEffect(() => {
    lockData?.unlockTime && setExtendedUnlockTime(lockData.unlockTime)
  }, [lockData])

  useEffect(() => {
    if (!contract || !connector || !getTokenData || !lockData) {
      setTokenContract(undefined)
      setLockTokenData(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider =>
        setTokenContract(new Contract(lockData.token, ERC20ABI, new Web3Provider(provider).getSigner())),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })

    getTokenData(lockData.token)
      .then(result => setLockTokenData(result))
      .catch(console.error)
  }, [contract, connector, lockData, getTokenData])

  useEffect(() => {
    switch (chainId) {
      // bsc testnet
      case 56:
        setLockAbi(contracts['56'].bsc.contracts.TokenLockerV1.abi)
        break
      case 97:
        setLockAbi(contracts['97'].bsctest.contracts.TokenLockerV1.abi)
        break
      case 1088:
        setLockAbi(contracts['1088'].metis.contracts.TokenLockerV1.abi)
        break
      // localhost
      // case 31337:
      //   setLockAbi(contracts['31337'].localhost.contracts[_tokenOrLp === 'token' ? 'TokenLockerV1' : 'LPLockerV1'].abi)
      //   break

      default:
        setLockAbi(undefined)
    }
  }, [chainId])

  useEffect(() => {
    if (!contract || !lockData || !lockAbi || !connector) {
      setLockContract(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider =>
        setLockContract(new Contract(lockData.contractAddress, lockAbi, new Web3Provider(provider).getSigner())),
      )
      .catch(err => {
        console.error(err)
        setLockContract(undefined)
      })
  }, [contract, lockData, connector, lockAbi])

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

    tokenContract
      .allowance(account, lockContract.address)
      .then((allowance_: BigNumber) =>
        setIsExtendApproved(allowance_.gte(utils.parseUnits(depositTokens, lockTokenData.decimals))),
      )
      .catch((err: Error) => {
        console.error(err)
        setIsExtendApproved(false)
      })
  }, [account, lockContract, lockTokenData, isExtending, depositTokens, tokenContract, extendedUnlockTime, lockData])

  useEffect(() => {
    if (!lockContract || !lockData || !lockData.isLpToken) {
      setLpLockData(undefined)
      return
    }

    lockContract
      .getLpData()
      .then((result: LPLockData) => setLpLockData(result))
      .catch((err: Error) => {
        // console.error(err)
        setLpLockData(undefined)
      })
  }, [lockContract, lockData])

  useEffect(() => {
    if (!lpLockData || !getTokenData || !lpLockData.hasLpData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    Promise.all([getTokenData(lpLockData.token0), getTokenData(lpLockData.token1)])
      .then(([token0Data, token1Data]) => {
        setLpToken0Data(token0Data)
        setLpToken1Data(token1Data)
      })
      .catch(err => {
        console.error(err)
        setLpToken0Data(undefined)
        setLpToken1Data(undefined)
      })
  }, [lpLockData, getTokenData])

  return (
    <DetailsCard
      headerContent={
        //
        lockData ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <Title>
                  <Link to={`/locker/${chainId}/${lock.id}`}>{lockTokenData?.symbol || '...'}</Link>
                </Title>

                <div className="text-sm">
                  Locked by{' '}
                  <Link to={`/locker/account/${lockData.createdBy}`} className="mt-2 text-indigo-500">
                    {getShortAddress(lockData.createdBy)}
                  </Link>
                  {lockData.lockOwner !== lockData.createdBy && (
                    <>
                      , owned by{' '}
                      <Link to={`/locker/account/${lockData.lockOwner}`} className="mt-2 text-indigo-500">
                        {getShortAddress(lockData.lockOwner)}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div
                className="cursor-default"
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
                    BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) && !lockData.balance.eq(0)
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
                {lockData.unlockTime > Date.now() / 1000 ? 'Locked' : lockData.balance.gt(0) ? 'Unlocked!' : 'Empty'}
              </Tooltip>
            </div>

            {/* {lpToken0Data && lpToken1Data && (
              <motion.div
                className="px-4 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-100 dark:bg-opacity-10 border-b border-gray-200 dark:border-transparent absolute left-0 right-0 -bottom-4 z-10"
                initial={{ scaleY: 0, y: '-100%', opacity: 0 }}
                animate={{ scaleY: 1, y: 0, opacity: 1 }}
              >
                <span>Pair: </span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500"
                  href={getExplorerTokenLink(getChainId(), lpToken0Data.address)}
                >
                  {lpToken0Data.symbol}
                </a>
                <FontAwesomeIcon icon={faExchangeAlt} fixedWidth size="sm" opacity={0.5} />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500"
                  href={getExplorerTokenLink(getChainId(), lpToken1Data.address)}
                >
                  {lpToken1Data.symbol}
                </a>
              </motion.div>
            )} */}
          </>
        ) : (
          // lockData is not ready
          <></>
        )
      }
      mainContent={
        //
        lockData ? (
          <>
            {lpToken0Data && lpToken1Data && (
              <motion.div
                className="px-4 flex items-center gap-1 bg-yellow-100 bg-opacity-50 dark:bg-yellow-200 dark:bg-opacity-5 border-b border-gray-200 dark:border-transparent absolute left-0 right-0 top-0 z-10"
                initial={{ scaleY: 0, y: '-100%', opacity: 0 }}
                animate={{ scaleY: 1, y: 0, opacity: 1 }}
              >
                <span>Pair: </span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500"
                  href={getExplorerTokenLink(getChainId(), lpToken0Data.address)}
                >
                  {lpToken0Data.symbol}
                </a>
                <FontAwesomeIcon icon={faExchangeAlt} fixedWidth size="sm" opacity={0.5} />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500"
                  href={getExplorerTokenLink(getChainId(), lpToken1Data.address)}
                >
                  {lpToken1Data.symbol}
                </a>
              </motion.div>
            )}

            <div className="flex-grow flex flex-col gap-2 mt-4">
              <Detail
                label="Locker address"
                value={
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500"
                    href={getExplorerContractLink(getChainId(), lockData.contractAddress)}
                  >
                    {getShortAddress(lockData.contractAddress)}
                  </a>
                }
              />
              <Detail
                label="Token address"
                value={
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500"
                    href={getExplorerTokenLink(getChainId(), lockData.token)}
                  >
                    {getShortAddress(lockData.token)}
                  </a>
                }
              />
              <Detail
                label="Tokens locked"
                value={utils.commify(utils.formatUnits(lockData.balance, lockTokenData?.decimals || 18))}
              />
              <Detail
                label="Percent of supply"
                value={`${utils.formatUnits(lockData.balance.mul(10000000).div(lockData.totalSupply), 5)}%`}
              />
              <Detail
                label={lockData.unlockTime > Date.now() / 1000 ? 'Unlocks at' : `Unlocked at`}
                value={new Date(lockData.unlockTime * 1000).toLocaleString()}
              />
            </div>
          </>
        ) : (
          <></>
        )
      }
      footerContent={
        lockData ? (
          lockData.lockOwner === account && lockContract ? (
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
                    lockContract
                      .withdraw()
                      .then((tx: any) => tx.wait())
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

                {/* <PrimaryButton
                  onClick={() => {
                    if (!lockContract) return

                    lockContract
                      .withdrawEth()
                      .then((tx: any) => tx.wait())
                      .then((tx: any) => console.log(tx))
                      .catch(console.error)
                  }}
                >
                  Recover ETH
                </PrimaryButton>

                <PrimaryButton
                  onClick={() => {
                    if (!lockContract) return

                    lockContract
                      .withdrawToken('token address')
                      .then((tx: any) => tx.wait())
                      .then((tx: any) => console.log(tx))
                      .catch(console.error)
                  }}
                >
                  Recover tokens
                </PrimaryButton> */}
              </section>

              {extendVisible && lockContract && lockData && lockTokenData && (
                <section className="flex flex-col gap-2 mt-4">
                  <TokenInput
                    tokenData={lockTokenData}
                    placeholder="Tokens to add (optional)"
                    onChange={value => setDepositTokens(value)}
                  />

                  <div className="flex bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded items-center">
                    <div className="p-3 flex-shrink-0">Unlock time</div>
                    <input
                      type="datetime-local"
                      className="flex-grow p-3 outline-none bg-white dark:bg-gray-700 rounded-r"
                      defaultValue={timestampToDateTimeLocal(lockData.unlockTime)}
                      onInput={e => setExtendedUnlockTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
                    />
                  </div>

                  <PrimaryButton
                    disabled={!canSubmitExtend || isExtending}
                    onClick={() => {
                      if (isExtendApproved) {
                        setIsExtending(true)
                        lockContract
                          .deposit(utils.parseUnits(depositTokens || '0', lockTokenData.decimals), extendedUnlockTime)
                          .then((tx: any) => tx.wait())
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
                        tokenContract
                          .approve(lockContract.address, utils.parseUnits(depositTokens, lockTokenData.decimals))
                          .then((tx: any) => tx.wait())
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
            </>
          ) : (
            undefined
          )
        ) : (
          // lockData is not ready
          undefined
        )
      }
    />
  )
}

export default Lock
