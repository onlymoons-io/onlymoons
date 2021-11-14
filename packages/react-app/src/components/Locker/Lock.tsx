import React, { useState, useEffect, useCallback, useContext } from 'react'
// import { useMount } from 'react-use'
// import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLockOpen, faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import humanizeDuration from 'humanize-duration'
import { UtilContractContext } from '../contracts/Util'
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import { TokenData, TokenLockData, LPLockData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import TokenInput from '../TokenInput'
import contracts from '../../contracts/production_contracts.json'
import { getShortAddress, getExplorerContractLink, getExplorerTokenLink, timestampToDateTimeLocal } from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'

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

const Outer = tw.div`
  
`

const Inner = tw.div`
  bg-gray-200
  text-gray-900
  rounded
`

const Section = tw.section`
  p-4
`

const Title = tw.h3`
  text-2xl
  font-light
  text-overflow
  overflow-hidden
  overflow-ellipsis
  flex
  justify-between
  items-center
  gap-3
`

// const ExplorerLinkCSS = styled.a``

// const ExplorerLink = tw(ExplorerLinkCSS)``

// const ExplorerLinkImgCSS = styled.img`
//   filter: grayscale(1);

//   ${ExplorerLinkCSS}:hover & {
//     filter: grayscale(0);
//   }
// `

// const ExplorerLinkImg = tw(ExplorerLinkImgCSS)`
//   select-none
//   pointer-events-none
//   bg-gray-100
//   rounded-full
//   w-5
//   h-5
// `

const Details = tw.div`
  flex
  justify-between
  w-full
`

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

interface LockDetailProps {
  label: React.ReactNode
  value: React.ReactNode
}

const LockDetail: React.FC<LockDetailProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <div className="text-lg">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  )
}

interface Props {
  lock: TokenLockData
}

const Lock: React.FC<Props> = ({ lock }) => {
  const { account, chainId, connector } = useWeb3React()
  const { getTokenData } = useContext(UtilContractContext)
  const { contract, getTokenLockData } = useContext(TokenLockerManagerV1ContractContext)
  const [lockData, setLockData] = useState<TokenLockData>(lock)
  const [lockTokenData, setLockTokenData] = useState<TokenData>()
  // const {getTokenLockData} = useContext(TokenLockerManagerV1ContractContext)
  // const [tokenOrLp, setTokenOrLp] = useState<'token' | 'lp'>((lock as any).token0 ? 'lp' : 'token')
  // const [lockName, setLockName] = useState<string>((lock as any).token0 ? '...' : '...')
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

  const getChainId = useCallback(() => {
    return chainId || 0
  }, [chainId])

  const updateLockData = useCallback(() => {
    if (!contract || !getTokenLockData) return

    getTokenLockData(lock.id)
      .then(lockData => setLockData({ ...lockData, address: lock.address }))
      .catch(console.error)
  }, [contract, lock, getTokenLockData])

  useEffect(() => {
    lockData.unlockTime && setExtendedUnlockTime(lockData.unlockTime)
  }, [lockData])

  useEffect(() => {
    if (!contract || !connector || !getTokenData) return

    connector
      .getProvider()
      .then(provider => {
        //
        setTokenContract(new Contract(lockData.token, ERC20ABI, new Web3Provider(provider).getSigner()))
      })
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
      // localhost
      // case 31337:
      //   setLockAbi(contracts['31337'].localhost.contracts[_tokenOrLp === 'token' ? 'TokenLockerV1' : 'LPLockerV1'].abi)
      //   break
      // bsc mainnet
      // case 56:
      //   setLockAbi(contracts['56'].bsc.contracts[_tokenOrLp === 'token' ? 'TokenLockerV1' : 'LPLockerV1'].abi)
      //   break
      // bsc testnet
      case 97:
        setLockAbi(contracts['97'].bsctest.contracts.TokenLockerV1.abi)
        break
      default:
        setLockAbi(undefined)
    }
  }, [lockData, chainId])

  useEffect(() => {
    if (!contract || !lockData || !lockAbi || !connector) {
      setLockContract(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider =>
        setLockContract(new Contract(lockData.address, lockAbi, new Web3Provider(provider).getSigner())),
      )
      .catch(err => {
        console.error(err)
        setLockContract(undefined)
      })
  }, [contract, lockData, connector, lockAbi])

  useEffect(() => {
    if (!account || !tokenContract || !lockTokenData || !lockContract) {
      setIsExtendApproved(false)
      return
    }

    if (!depositTokens || depositTokens === '' || depositTokens === '0') {
      setIsExtendApproved(true)
      setCanSubmitExtend(extendedUnlockTime > lockData.unlockTime)
      return
    } else {
      setCanSubmitExtend(true)
    }

    //
    tokenContract
      .allowance(account, lockContract.address)
      .then((allowance_: BigNumber) => {
        //
        setIsExtendApproved(allowance_.gte(utils.parseUnits(depositTokens, lockTokenData.decimals)))
      })
      .catch((err: Error) => {
        console.error(err)
        setIsExtendApproved(false)
      })
  }, [account, lockContract, lockTokenData, isExtending, depositTokens, tokenContract, extendedUnlockTime, lockData])

  useEffect(() => {
    if (!lockContract) {
      setLpLockData(undefined)
      return
    }

    //
    lockContract
      .getLpData()
      .then((result: LPLockData) => setLpLockData(result))
      .catch((err: Error) => {
        console.error(err)
        setLpLockData(undefined)
      })
  }, [lockContract])

  useEffect(() => {
    if (!lpLockData || !getTokenData) {
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
        //
        console.error(err)
        setLpToken0Data(undefined)
        setLpToken1Data(undefined)
      })
  }, [lpLockData, getTokenData])

  // useMount(() => updateLockData())

  return (
    <Outer>
      <Inner className="relative">
        <Section>
          <Title>
            <Link to={`/locker/${chainId}/${lock.id}`}>{lockTokenData?.symbol || '...'}</Link>
          </Title>

          <div className="text-sm">
            Locked by{' '}
            <Link to={`/locker/account/${lockData.owner}`} className="mt-2 text-indigo-500">
              {getShortAddress(lockData.owner)}
            </Link>
          </div>
        </Section>

        {lpToken0Data && lpToken1Data && (
          <motion.div
            className="px-4 flex gap-1 bg-yellow-100 border-b border-gray-200 absolute left-0 right-0"
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
            <span>/</span>
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

        <Section className="bg-gray-100 rounded-b">
          <Details className="mt-3">
            <div className="flex-grow flex flex-col gap-2">
              <LockDetail
                label="Locker address"
                value={
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500"
                    href={getExplorerContractLink(getChainId(), lockData.address)}
                  >
                    {getShortAddress(lockData.address)}
                  </a>
                }
              />
              <LockDetail
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
              <LockDetail
                label="Tokens locked"
                value={utils.commify(utils.formatUnits(lockData.tokenBalance, lockTokenData?.decimals || 18))}
              />
              <LockDetail
                label="Percent of supply"
                value={`${utils.formatUnits(lockData.tokenBalance.mul(10000000).div(lockData.totalSupply), 5)}%`}
              />
              <LockDetail
                label={lockData.unlockTime > Date.now() / 1000 ? 'Unlocks at' : `Unlocked at`}
                value={new Date(lockData.unlockTime * 1000).toLocaleString()}
              />
            </div>

            <div className="m-auto p-5" style={{ maxWidth: '132px' }}>
              <CircularProgressbar
                value={(() => {
                  //
                  const duration = lockData.unlockTime - lockData.createdAt
                  const progress = Math.ceil(Date.now() / 1000) - lockData.createdAt

                  return 100 - (progress / duration) * 100
                })()}
                styles={
                  BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) && !lockData.tokenBalance.eq(0)
                    ? progressStylesUnlocked
                    : progressStyles
                }
                children={
                  BigNumber.from(Math.ceil(Date.now() / 1000)).gte(lockData.unlockTime) ? (
                    <FontAwesomeIcon
                      className={`text-2xl text-gray-${lockData.tokenBalance.eq(0) ? '400' : '700'}`}
                      icon={lockData.tokenBalance.eq(0) ? faCheck : faLockOpen}
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

              <div className="m-auto text-center mt-2">
                {lockData.unlockTime > Date.now() / 1000
                  ? 'Locked'
                  : lockData.tokenBalance.gt(0)
                  ? 'Unlocked'
                  : 'Empty'}
              </div>
            </div>

            {/* <Link to={`/locker/account/${lockData.owner}`}>More from {getShortAddress(lockData.owner)}</Link> */}
          </Details>
        </Section>

        {lockData.owner === account && lockContract && (
          <>
            <Section className="text-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <PrimaryButton className="flex-grow" onClick={() => setExtendVisible(!extendVisible)}>
                Extend / Deposit
              </PrimaryButton>
              <PrimaryButton
                className="flex-grow relative flex justify-center items-center"
                disabled={
                  isWithdrawing ||
                  lockData.tokenBalance.eq(0) ||
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
            </Section>

            {extendVisible && lockContract && lockData && lockTokenData && (
              <Section className="flex flex-col gap-2">
                <TokenInput
                  tokenData={lockTokenData}
                  placeholder="Tokens to add (optional)"
                  onChange={value => setDepositTokens(value)}
                />

                <div className="flex bg-gray-100 text-gray-800 rounded items-center">
                  <div className="p-3 flex-shrink-0">Unlock time</div>
                  <input
                    type="datetime-local"
                    className="flex-grow p-3 outline-none bg-white rounded-r"
                    defaultValue={timestampToDateTimeLocal(lockData.unlockTime)}
                    onInput={e => setExtendedUnlockTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
                  />
                </div>

                <PrimaryButton
                  disabled={!canSubmitExtend}
                  onClick={() => {
                    //
                    if (isExtendApproved) {
                      //
                      setIsExtending(true)
                      lockContract
                        .deposit(utils.parseUnits(depositTokens || '0', lockTokenData.decimals), extendedUnlockTime)
                        .then((tx: any) => {
                          //
                          return tx.wait()
                        })
                        .then(() => {
                          //
                          setIsExtending(false)
                          updateLockData()
                          setExtendVisible(false)
                        })
                        .catch((err: Error) => {
                          console.error(err)
                          setIsExtending(false)
                        })
                    } else if (tokenContract && lockContract && lockTokenData) {
                      //
                      setIsExtending(true)
                      tokenContract
                        .approve(lockContract.address, utils.parseUnits(depositTokens, lockTokenData.decimals))
                        .then((tx: any) => {
                          return tx.wait()
                        })
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
              </Section>
            )}
          </>
        )}
      </Inner>
    </Outer>
  )
}

export default Lock
