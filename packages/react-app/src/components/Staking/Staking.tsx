import React, { useState, useEffect, useCallback, useContext, useRef, CSSProperties } from 'react'
import { useMount, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import 'react-circular-progressbar/dist/styles.css'
import { UtilContractContext } from '../contracts/Util'
import { StakingManagerV1ContractContext } from '../contracts/StakingManagerV1'
import { TokenData, StakingData, StakingDataForAccount } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import { NotificationCatcherContext } from '../NotificationCatcher'
import contracts from '../../contracts/production_contracts.json'
import { getShortAddress, getExplorerContractLink, getExplorerTokenLink, getNativeCoin } from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import TokenInput from '../TokenInput'

const { Web3Provider } = providers

export interface StakingProps {
  stakingData: StakingData
  startExpanded?: boolean
  className?: string
  style?: CSSProperties
}

const Staking: React.FC<StakingProps> = ({ stakingData, startExpanded = false, className = '', style = {} }) => {
  const { account, chainId, connector } = useWeb3React()
  const { push: pushNotification } = useContext(NotificationCatcherContext)
  const { getTokenData } = useContext(UtilContractContext)
  const { contract, owner, setSoloStakingId, setLpStakingId } = useContext(StakingManagerV1ContractContext)
  const [_stakingData, setStakingData] = useState<StakingData | undefined>(stakingData)
  const [stakingTokenData, setStakingTokenData] = useState<TokenData>()
  const [stakingContract, setStakingContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [stakingAbi, setStakingAbi] = useState<any>()
  const [depositTokens, setDepositTokens] = useState<string>('')
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(startExpanded)
  const [settingStakingToken, setSettingStakingToken] = useState<boolean>(false)
  const depositInputRef = useRef<HTMLInputElement>(null)
  const withdrawInputRef = useRef<HTMLInputElement>(null)
  const [depositApproved, setDepositApproved] = useState<boolean>(false)
  const [depositLoading, setDepositLoading] = useState<boolean>(false)
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false)
  const [stakingDataForAccount, setStakingDataForAccount] = useState<StakingDataForAccount>()
  // const [withdrawApproved, setWithdrawApproved] = useState<boolean>(false)

  useMount(() => setStakingData(_stakingData))
  useUnmount(() => setStakingData(undefined))

  const getChainId = useCallback(() => {
    return chainId || 0
  }, [chainId])

  useEffect(() => {
    if (!contract || !connector || !getTokenData || !_stakingData) {
      setTokenContract(undefined)
      setStakingTokenData(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider =>
        setTokenContract(new Contract(_stakingData.stakedToken, ERC20ABI, new Web3Provider(provider).getSigner())),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })

    getTokenData(_stakingData.stakedToken)
      .then(result => setStakingTokenData(result))
      .catch(console.error)
  }, [contract, connector, _stakingData, getTokenData])

  useEffect(() => {
    if (!account || !tokenContract || !_stakingData || !stakingTokenData) {
      setDepositApproved(false)
      return
    }

    //
    tokenContract
      .allowance(account, _stakingData.contractAddress)
      .then((allowance: BigNumber) => {
        setDepositApproved(allowance.gte(stakingTokenData.balance))
      })
      .catch((err: Error) => {
        console.error(err)
        setDepositApproved(false)
      })
  }, [account, tokenContract, _stakingData, stakingTokenData])

  useEffect(() => {
    switch (chainId) {
      // bsc testnet
      case 56:
        // setStakingAbi(contracts['56'].bsc.contracts.TokenLockerV1.abi)
        break
      case 97:
        setStakingAbi(contracts['97'].bsctest.contracts.StakingV1.abi)
        break
      // localhost
      // case 31337:
      //   setStakingAbi(contracts['31337'].localhost.contracts[_tokenOrLp === 'token' ? 'TokenLockerV1' : 'LPLockerV1'].abi)
      //   break

      default:
        setStakingAbi(undefined)
    }
  }, [chainId])

  useEffect(() => {
    if (!contract || !_stakingData || !stakingAbi || !connector) {
      setStakingContract(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider =>
        setStakingContract(
          new Contract(_stakingData.contractAddress, stakingAbi, new Web3Provider(provider).getSigner()),
        ),
      )
      .catch(err => {
        console.error(err)
        setStakingContract(undefined)
      })
  }, [contract, _stakingData, connector, stakingAbi])

  useEffect(() => {
    if (!account || !stakingContract) {
      setStakingDataForAccount(undefined)
      return
    }

    stakingContract
      .getStakingDataForAccount(account)
      .then((result: StakingDataForAccount) => {
        setStakingDataForAccount(result)
      })
      .catch((err: Error) => {
        console.error(err)
        setStakingDataForAccount(undefined)
      })
  }, [account, stakingContract])

  useEffect(() => {
    console.log('staking data for account', stakingDataForAccount)
  }, [stakingDataForAccount])

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
                  <Link to={`/staking/${chainId}/${_stakingData.id}`}>{_stakingData.name || '...'}</Link>
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
        _stakingData && stakingTokenData ? (
          <>
            <div className="flex-grow flex flex-col gap-3">
              {/* <span>
                Stake {stakingTokenData?.symbol || '...'} and receive {chainId ? getNativeCoin(chainId).symbol : '...'}
              </span> */}

              <div className="flex justify-between gap-2 w-full">
                <TokenInput
                  placeholder="Tokens to deposit"
                  className="w-2/3 flex-shrink-0"
                  tokenData={stakingTokenData}
                  maxValue={stakingTokenData.balance}
                  inputRef={depositInputRef}
                />

                <PrimaryButton
                  className="self-end flex-grow h-11"
                  disabled={!stakingContract || !tokenContract || depositLoading}
                  onClick={async () => {
                    if (!stakingContract || !depositInputRef.current || !tokenContract) return

                    setDepositLoading(true)

                    if (!depositApproved) {
                      //
                      try {
                        const tx = await tokenContract.approve(
                          _stakingData.contractAddress,
                          BigNumber.from(
                            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                          ),
                        )
                        await tx.wait()

                        setDepositApproved(true)
                      } catch (err) {
                        console.error(err)
                      }
                    } else {
                      try {
                        const tx = await stakingContract.deposit(
                          utils.parseUnits(depositInputRef.current.value, stakingTokenData.decimals),
                        )
                        await tx.wait()
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
                  className="w-2/3 flex-shrink-0"
                  tokenData={stakingTokenData}
                  maxValue={BigNumber.from(0)}
                  inputRef={withdrawInputRef}
                />

                <PrimaryButton
                  className="self-end flex-grow h-11"
                  disabled={true}
                  onClick={() => {
                    if (!stakingContract || !depositInputRef.current) return

                    //
                  }}
                >
                  <div className="">Withdraw</div>
                </PrimaryButton>
              </div>

              <PrimaryButton
                disabled={!stakingDataForAccount || stakingDataForAccount.amount.eq(0)}
                onClick={() => {
                  if (!stakingContract) return

                  stakingContract
                    .claim()
                    .then((tx: any) => tx.wait())
                    .catch((err: Error) => {
                      console.error(err)
                    })
                }}
              >{`Claim ${utils.formatEther(stakingDataForAccount?.pending || 0)} ${
                getNativeCoin(chainId || 0).symbol
              }`}</PrimaryButton>

              {stakingContract && stakingTokenData && (
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
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500"
                        href={getExplorerContractLink(getChainId(), stakingContract.address)}
                      >
                        <span>{getShortAddress(stakingContract.address)}</span>
                        {/* <FontAwesomeIcon className="ml-1" size="xs" icon={faExternalLinkAlt} /> */}
                      </a>
                    }
                  />
                  <Detail
                    label={`Token (${stakingTokenData.symbol})`}
                    value={
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500"
                        href={getExplorerTokenLink(getChainId(), _stakingData.stakedToken)}
                      >
                        <span>{getShortAddress(_stakingData.stakedToken)}</span>
                        {/* <FontAwesomeIcon className="ml-1" size="xs" icon={faExternalLinkAlt} /> */}
                      </a>
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
                    value={`${utils.commify(utils.formatUnits(_stakingData.totalRewards, _stakingData.decimals))} ${
                      chainId ? getNativeCoin(chainId).symbol : ''
                    }`}
                  />

                  {owner && owner === account && (
                    <>
                      <hr className="my-1 opacity-10" />

                      <div className="grid grid-cols-2 gap-2">
                        <PrimaryButton
                          disabled={settingStakingToken}
                          onClick={() => {
                            setSettingStakingToken(true)

                            setSoloStakingId &&
                              setSoloStakingId(_stakingData.id)
                                .then(() => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: `Set solo staking id to ${_stakingData.id}`,
                                      level: 'success',
                                    })
                                })
                                .catch(err => {
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

                            setLpStakingId &&
                              setLpStakingId(_stakingData.id)
                                .then(() => {
                                  setSettingStakingToken(false)

                                  pushNotification &&
                                    pushNotification({
                                      message: `Set LP staking id to ${_stakingData.id}`,
                                      level: 'success',
                                    })
                                })
                                .catch(err => {
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
        ) : (
          // _stakingData is not ready
          undefined
        )
      }
    />
  )
}

export default Staking
