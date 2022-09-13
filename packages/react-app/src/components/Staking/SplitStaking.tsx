import React, { useEffect, useState, useCallback, useRef } from 'react'
import { usePromise, useUnmount } from 'react-use'
import tw from 'tailwind-styled-components'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, utils, providers } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBalanceScale,
  faBalanceScaleLeft,
  faBalanceScaleRight,
  faExternalLinkAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useStakingManagerV1Contract } from '../contracts/StakingManagerV1'
import SplitStakingV1ContractContextProvider, { useSplitStakingV1Contract } from '../contracts/SplitStakingV1'
import Staking from './Staking'
import { StakingData, SplitStakingRewardsData, AllRewardsForAddress, StakingDataForAccount } from '../../typings'
import { Primary as PrimaryButton } from '../Button'
import { useNotifications } from '../NotificationCatcher'
import { getExplorerContractLink, getNativeCoin, getShortAddress } from '../../util'
import humanNumber from 'human-number'
import { Web3Provider as Web3ProviderClass } from '@ethersproject/providers'
import { ERC20ABI } from '../../contracts/external_contracts'
import contracts from '../../contracts/compiled_contracts.json'
import Tooltip from '../Tooltip'

const { Web3Provider } = providers

const SplitStakingTopSection = tw.div`
  
`

const SplitStakingTopSectionInner = tw.div`
  bg-gray-100
  dark:bg-gray-800
  grid
  gap-2
  justify-between
  items-start
  text-center
  p-4
  rounded
`

const stakingAbi = contracts['StakingV1'].abi

const SplitStakingComponent: React.FC = () => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const {
    contract,
    globalStakingData,
    distribute,
    canDistribute,
    claimSplitStaking,
    getSplitStakingRewardsForAddress,
    getStakingRewards,
    getRewardsRatio,
  } = useSplitStakingV1Contract()
  const { getStakingDataByAddress } = useStakingManagerV1Contract()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const { push: pushNotification } = useNotifications()
  const [soloStakingContract, setSoloStakingContract] = useState<Contract>()
  const [lpStakingContract, setLpStakingContract] = useState<Contract>()
  const [soloStakingData, setSoloStakingData] = useState<StakingData>()
  const [lpStakingData, setLpStakingData] = useState<StakingData>()
  const [soloStakingDataForAccount, setSoloStakingDataForAccount] = useState<StakingDataForAccount>()
  const [lpStakingDataForAccount, setLpStakingDataForAccount] = useState<StakingDataForAccount>()
  const [allRewardsAmount, setAllRewardsAmount] = useState<AllRewardsForAddress>({
    pending: BigNumber.from(0),
    claimed: BigNumber.from(0),
  })
  const [splitStakingRewards, setSplitStakingRewards] = useState<SplitStakingRewardsData>()
  const [provider, setProvider] = useState<Web3ProviderClass>()
  const [claimingAll, setClaimingAll] = useState<boolean>(false)
  const [rewardsRatio, setRewardsRatio] = useState<number>(5000)
  const timerRef = useRef<NodeJS.Timeout>()

  // useEffect(() => {
  //   setStakingAbi(contracts['StakingV1'].abi)
  // }, [chainId])

  useEffect(() => {
    if (!soloStakingData || !lpStakingData || !stakingAbi || !connector) {
      setSoloStakingContract(undefined)
      setLpStakingContract(undefined)
      return
    }

    mounted(
      Promise.all([
        //
        connector
          .getProvider()
          .then(
            (provider) =>
              new Contract(soloStakingData.contractAddress, stakingAbi, new Web3Provider(provider, 'any').getSigner()),
          ),
        connector
          .getProvider()
          .then(
            (provider) =>
              new Contract(lpStakingData.contractAddress, stakingAbi, new Web3Provider(provider, 'any').getSigner()),
          ),
      ]),
    )
      .then(([_soloStakingContract, _lpStakingContract]) => {
        setSoloStakingContract(_soloStakingContract)
        setLpStakingContract(_lpStakingContract)
      })
      .catch((err: Error) => {
        console.error(err)
        setSoloStakingContract(undefined)
        setLpStakingContract(undefined)
      })
  }, [mounted, contract, soloStakingData, lpStakingData, connector])

  useEffect(() => {
    if (!getStakingDataByAddress || !globalStakingData?.ready) {
      setSoloStakingData(undefined)
      setLpStakingData(undefined)
      return
    }

    mounted(
      Promise.all([
        getStakingDataByAddress(globalStakingData.soloStakingAddress),
        getStakingDataByAddress(globalStakingData.lpStakingAddress),
      ]),
    )
      .then(([_soloStakingData, _lpStakingData]) => {
        setSoloStakingData(_soloStakingData)
        setLpStakingData(_lpStakingData)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [mounted, getStakingDataByAddress, globalStakingData])

  const updateAllRewardsAmount = useCallback(() => {
    if (!account || !getSplitStakingRewardsForAddress) {
      setAllRewardsAmount({
        pending: BigNumber.from(0),
        claimed: BigNumber.from(0),
      })
      return
    }

    mounted(getSplitStakingRewardsForAddress(account))
      .then(setAllRewardsAmount)
      .catch((err: Error) => {
        // ignore this error for now
        // TODO - fix error reporting here
        // this gets called before the staking manager contract
        // is ready, and always shows the error on first load
      })
  }, [mounted, account, getSplitStakingRewardsForAddress])

  useEffect(updateAllRewardsAmount, [updateAllRewardsAmount])

  const updateSplitStakingRewards = useCallback(() => {
    if (!getStakingRewards) {
      setSplitStakingRewards(undefined)
      return
    }

    mounted(getStakingRewards())
      .then(setSplitStakingRewards)
      .catch((err: Error) => {
        console.error(err)
        setSplitStakingRewards(undefined)
      })
  }, [mounted, getStakingRewards])

  useEffect(updateSplitStakingRewards, [updateSplitStakingRewards])

  useEffect(() => {
    if (!connector) {
      setProvider(undefined)
      return
    }

    mounted(connector.getProvider())
      .then((_provider: any) => setProvider(new Web3Provider(_provider, 'any')))
      .catch((err: Error) => {
        console.error(err)
        setProvider(undefined)
      })
  }, [mounted, connector])

  useEffect(() => {
    if (!provider) {
      return
    }

    const newBlockListener = (blockNumber: any) => {
      timerRef.current && clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        updateSplitStakingRewards()
      }, 250)
    }

    provider.on('block', newBlockListener)

    // reference needed for cleanup
    const _provider = provider

    // cleanup
    return () => {
      // console.log(_provider)
      _provider?.off('block', newBlockListener)
    }
  }, [provider, updateSplitStakingRewards])

  useUnmount(() => timerRef.current && clearTimeout(timerRef.current))

  const updateRewardsRatio = useCallback(() => {
    if (!globalStakingData || !getRewardsRatio) {
      setRewardsRatio(5000)
      return
    }

    mounted(getRewardsRatio())
      .then((result) => {
        setRewardsRatio(result)
      })
      .catch((err: Error) => {
        pushNotification && pushNotification(err)
        console.error(err)
      })
  }, [mounted, globalStakingData, getRewardsRatio, pushNotification])

  useEffect(() => {
    if (!globalStakingData || !connector) {
      setTokenContract(undefined)
      return
    }

    // set initial rewards ratio
    setRewardsRatio(globalStakingData.rewardsRatio)

    mounted(connector.getProvider())
      .then((provider) =>
        setTokenContract(
          new Contract(globalStakingData.mainToken, ERC20ABI, new Web3Provider(provider, 'any').getSigner()),
        ),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })
  }, [mounted, globalStakingData, connector])

  useEffect(() => {
    if (!account || !tokenContract) {
      return
    }

    const _tokenContract = tokenContract
    const _updateRewardsRatio = updateRewardsRatio

    const transferFromFilter = _tokenContract.filters['Transfer'](account)
    const transferToFilter = _tokenContract.filters['Transfer'](null, account)

    _tokenContract.on(transferFromFilter, _updateRewardsRatio)
    _tokenContract.on(transferToFilter, _updateRewardsRatio)

    return () => {
      _tokenContract.off(transferFromFilter, _updateRewardsRatio)
      _tokenContract.off(transferToFilter, _updateRewardsRatio)
    }
  }, [account, tokenContract, updateRewardsRatio])

  useEffect(() => {
    if (!account || !soloStakingContract || !lpStakingContract) {
      setSoloStakingDataForAccount(undefined)
      setLpStakingDataForAccount(undefined)
      return
    }

    mounted(
      Promise.all([
        soloStakingContract.getStakingDataForAccount(account),
        lpStakingContract.getStakingDataForAccount(account),
      ]),
    )
      .then(([_soloStakingData, _lpStakingData]) => {
        //
        setSoloStakingDataForAccount(_soloStakingData)
        setLpStakingDataForAccount(_lpStakingData)
      })
      .catch((err: Error) => {
        console.error(err)
        setSoloStakingDataForAccount(undefined)
        setLpStakingDataForAccount(undefined)
      })
  }, [mounted, account, soloStakingContract, lpStakingContract])

  const getEstimatedRewards: () => BigNumber = useCallback(() => {
    if (
      !soloStakingDataForAccount ||
      !lpStakingDataForAccount ||
      !splitStakingRewards ||
      !soloStakingData ||
      !lpStakingData
    ) {
      return BigNumber.from(0)
    }

    return BigNumber.from(0)
      .add(
        !soloStakingDataForAccount.amount.gt(0) || !splitStakingRewards.soloStakingRewards.gt(0)
          ? 0
          : splitStakingRewards.soloStakingRewards
              .mul(BigNumber.from(10).pow(18))
              .div(soloStakingData.totalStaked.mul(BigNumber.from(10).pow(18)).div(soloStakingDataForAccount.amount)),
      )
      .add(
        !lpStakingDataForAccount.amount.gt(0) || !splitStakingRewards.lpStakingRewards.gt(0)
          ? 0
          : splitStakingRewards.lpStakingRewards
              .mul(BigNumber.from(10).pow(18))
              .div(lpStakingData.totalStaked.mul(BigNumber.from(10).pow(18)).div(lpStakingDataForAccount.amount)),
      )
  }, [soloStakingDataForAccount, lpStakingDataForAccount, splitStakingRewards, soloStakingData, lpStakingData])

  return (
    <>
      {contract && globalStakingData?.ready ? (
        soloStakingData && lpStakingData ? (
          <>
            <div className="w-full flex flex-col lg:flex-row gap-4 rounded text-gray-800 dark:text-gray-200">
              <SplitStakingTopSection className="flex-grow">
                <SplitStakingTopSectionInner className="grid-cols-2 h-full flex justify-center items-center">
                  <div className="flex flex-col justify-center items-center gap-1 font-extralight w-full">
                    <div className="opacity-60">Staking contract</div>
                    <div className="text-xl">
                      <a
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-indigo-600 dark:text-indigo-400"
                        href={getExplorerContractLink(chainId || 0, contract.address)}
                      >
                        {getShortAddress(contract.address)}{' '}
                        <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" className="opacity-40" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center gap-1 font-extralight w-full">
                    <div className="opacity-60">
                      Rewards balance <FontAwesomeIcon icon={faInfoCircle} />
                    </div>
                    <div className="text-xl">
                      {humanNumber(
                        parseFloat(utils.formatEther(splitStakingRewards?.waitingRewards || BigNumber.from(0))),
                        (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}{' '}
                      {getNativeCoin(chainId || 0).symbol}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center gap-1 font-extralight w-full">
                    <div className="opacity-60">Rewards distributed</div>
                    <div className="text-xl">
                      {humanNumber(
                        !splitStakingRewards
                          ? 0
                          : parseFloat(
                              utils.formatEther(
                                splitStakingRewards.totalRewards.sub(splitStakingRewards.waitingRewards),
                              ),
                            ),
                        (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}{' '}
                      {getNativeCoin(chainId || 0).symbol}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center gap-1 font-extralight w-full">
                    <div className="opacity-60">
                      Rewards ready <FontAwesomeIcon icon={faInfoCircle} />
                    </div>
                    <div className="text-xl">
                      {humanNumber(
                        parseFloat(utils.formatEther(splitStakingRewards?.combinedRewards || BigNumber.from(0))),
                        (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}{' '}
                      {getNativeCoin(chainId || 0).symbol}
                    </div>
                  </div>
                </SplitStakingTopSectionInner>
              </SplitStakingTopSection>

              <SplitStakingTopSection className="">
                <SplitStakingTopSectionInner className="grid-cols-1 lg:w-96">
                  <>
                    <div
                      data-tip={true}
                      data-for="your-earnings-tooltip"
                      className="flex justify-between items-center font-extralight w-full"
                    >
                      <div className="opacity-60">
                        Your earnings <FontAwesomeIcon icon={faInfoCircle} />
                        {/* <Button
                                    onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                                    data-tip={true}
                                    data-for="dark-mode"
                                    style={{ border: 'none !important', outline: 'none !important' }}
                                  >
                                    <FontAwesomeIcon icon={darkModeEnabled ? farSun : faSun} size="lg" opacity={0.8} />
                                  </Button> */}
                      </div>{' '}
                      <div className="text-xl">
                        {account ? (
                          <>
                            {humanNumber(parseFloat(utils.formatEther(allRewardsAmount.claimed)), (n) =>
                              n.toLocaleString('en', { maximumFractionDigits: 5 }),
                            )}{' '}
                            {getNativeCoin(chainId || 0).symbol}
                          </>
                        ) : (
                          <>-</>
                        )}
                      </div>
                    </div>

                    <Tooltip
                      id="your-earnings-tooltip"
                      className="max-w-xs"
                      place="bottom"
                      children="Total amount of earnings with the current staking contracts."
                    />
                  </>

                  <>
                    <div
                      data-tip={true}
                      data-for="pending-rewards-tooltip"
                      className="flex justify-between items-center font-extralight w-full"
                    >
                      <div className="opacity-60">
                        Pending rewards <FontAwesomeIcon icon={faInfoCircle} />
                      </div>{' '}
                      <div className="text-xl">
                        {account ? (
                          <>
                            ~
                            {humanNumber(
                              parseFloat(utils.formatEther(allRewardsAmount.pending.add(getEstimatedRewards()))),
                              (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                            )}{' '}
                            {getNativeCoin(chainId || 0).symbol}
                          </>
                        ) : (
                          <>-</>
                        )}
                      </div>
                    </div>

                    <Tooltip
                      id="pending-rewards-tooltip"
                      place="bottom"
                      className="max-w-xs"
                      children={
                        <div>
                          Your estimated pending rewards. This includes{' '}
                          <span className="font-bold text-green-400">
                            {utils.formatEther(allRewardsAmount.pending)} {getNativeCoin(chainId || 0).symbol}{' '}
                          </span>
                          confirmed rewards and{' '}
                          <span className="font-bold text-yellow-300">
                            ~{utils.formatEther(getEstimatedRewards())} {getNativeCoin(chainId || 0).symbol}
                          </span>{' '}
                          estimated rewards if you claim now.
                        </div>
                      }
                    />
                  </>

                  <div className="flex justify-between items-center font-extralight w-full">
                    <div className="opacity-60">
                      Bounty <FontAwesomeIcon icon={faInfoCircle} />
                    </div>{' '}
                    <div className="text-xl">
                      ~
                      {humanNumber(
                        parseFloat(utils.formatEther(splitStakingRewards?.distributorReward || BigNumber.from(0))),
                        (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}{' '}
                      {getNativeCoin(chainId || 0).symbol}
                    </div>
                  </div>

                  <PrimaryButton
                    className="w-full"
                    disabled={
                      // !claimAll || allRewardsAmount.pending.eq(0) || claimingAll
                      !account ||
                      claimingAll ||
                      !(
                        (distribute &&
                          splitStakingRewards &&
                          !splitStakingRewards.combinedRewards.eq(0) &&
                          canDistribute) ||
                        (claimSplitStaking && !allRewardsAmount.pending.eq(0))
                      )

                      // !distribute ||
                      // !splitStakingRewards ||
                      // !(!splitStakingRewards.combinedRewards.eq(0) && canDistribute) ||
                      // claimingAll
                    }
                    onClick={() => {
                      if (!claimSplitStaking) return

                      setClaimingAll(true)

                      claimSplitStaking()
                        .catch((err: Error) => pushNotification && pushNotification(err))
                        .then(() => {
                          updateAllRewardsAmount()
                          setClaimingAll(false)
                        })
                    }}
                  >
                    {claimingAll ? (
                      <>Claiming</>
                    ) : (
                      <>
                        Claim ~
                        {humanNumber(
                          parseFloat(
                            utils.formatEther(
                              allRewardsAmount.pending
                                .add(splitStakingRewards?.distributorReward || 0)
                                .add(getEstimatedRewards()),
                            ),
                          ),
                          (n) => n.toLocaleString('en', { maximumFractionDigits: 5 }),
                        )}{' '}
                        {getNativeCoin(chainId || 0).symbol}
                      </>
                    )}
                  </PrimaryButton>
                </SplitStakingTopSectionInner>
              </SplitStakingTopSection>
            </div>

            <div className="w-full lg:grid-flow-col-dense grid rounded text-gray-800 dark:text-gray-300">
              <div className="flex flex-col">
                <div className="text-3xl py-4 self-center">Solo staking</div>

                {/* <hr className="opacity-10" /> */}

                <Staking stakingData={soloStakingData} startExpanded={false} onClaimed={updateAllRewardsAmount} />
              </div>

              <div className="flex flex-col gap-2 items-center justify-center text-gray-900 dark:text-gray-200">
                <div className="flex flex-col gap-3 items-center">
                  <FontAwesomeIcon
                    opacity={0.5}
                    className="text-4xl md:text-3xl lg:text-5xl"
                    icon={
                      rewardsRatio < 5000
                        ? faBalanceScaleRight
                        : rewardsRatio > 5000
                        ? faBalanceScaleLeft
                        : faBalanceScale
                    }
                  />

                  {rewardsRatio !== 5000 && (
                    <>
                      <span className="text-center">Favors {rewardsRatio < 5000 ? 'LP' : 'Solo'} by </span>
                      <span className="text-center text-xl">{(Math.abs(5000 - rewardsRatio) / 10 ** 2) * 2}%</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-3xl py-4 self-center">LP staking</div>

                <Staking stakingData={lpStakingData} startExpanded={false} onClaimed={updateAllRewardsAmount} />
              </div>
            </div>
          </>
        ) : (
          <div>Staking data is loading</div>
        )
      ) : (
        <div>Staking data is not ready</div>
      )}
    </>
  )
}

const SplitStakingComponentWrapper: React.FC = () => {
  return (
    <SplitStakingV1ContractContextProvider>
      <SplitStakingComponent />
    </SplitStakingV1ContractContextProvider>
  )
}

export default SplitStakingComponentWrapper
