import React, { useContext, useEffect, useState, useCallback } from 'react'
// import { useUnmount } from 'react-use'
import { useParams } from 'react-router-dom'
// import tw from 'tailwind-styled-components'
import { useWeb3React } from '@web3-react/core'
// import { /*BigNumber, Contract, utils,*/ providers } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  // faBalanceScale,
  // faBalanceScaleLeft,
  // faBalanceScaleRight,
  // faExternalLinkAlt,
  faSadTear,
  // faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import SplitStakingV1ContractContextProvider from '../contracts/SplitStakingV1'
import StakingManagerV1ContractContextProvider, { StakingManagerV1ContractContext } from '../contracts/StakingManagerV1'
import Staking from './Staking'
import NotConnected from '../NotConnected'
import { StakingData /*SplitStakingRewardsData, AllRewardsForAddress, StakingDataForAccount*/ } from '../../typings'
import Button from '../Button'
import { Outer, MidSection, SectionInner, Grid, Loading } from '../Layout'
// import { NotificationCatcherContext } from '../NotificationCatcher'
// import { getExplorerContractLink, getNativeCoin, getShortAddress } from '../../util'
// import humanNumber from 'human-number'
// import { Web3Provider as Web3ProviderClass } from '@ethersproject/providers'
// import { ERC20ABI } from '../../contracts/external_contracts'
// import contracts from '../../contracts/production_contracts.json'
// import Tooltip from '../Tooltip'
import SplitStaking from './SplitStaking'

// const { Web3Provider } = providers

const StakingComponent: React.FC = () => {
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { account, chainId, connector } = useWeb3React()
  const {
    stakingEnabledOnNetwork,
    contract,
    count,
    // globalStakingData,
    getStakingDataByAddress,
    getStakingDataById,
    // distribute,
    // canDistribute,
    // claimAll,
    // claimSplitStaking,
    // getSplitStakingRewardsForAddress,
    // getStakingRewards,
    // getRewardsRatio,
  } = useContext(StakingManagerV1ContractContext)
  // const { push: pushNotification } = useContext(NotificationCatcherContext)
  const [stakingInstances, setStakingInstances] = useState<Array<StakingData>>([])
  const [sortedStakingInstances, setSortedStakingInstances] = useState<Array<StakingData>>([])
  const [viewMode, setViewMode] = useState<'split' | 'all'>('split')

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      //
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupAllStaking = useCallback(() => {
    if (!contract || !account || !count || !getStakingDataById) {
      setStakingInstances([])
      return
    }

    if (idToUse) {
      getStakingDataById(parseInt(idToUse))
        .then(result => setStakingInstances([result]))
        .catch(console.error)
    } else if (accountToCheck) {
      // getTokenLockersForAddress(accountToCheck).then((ids: Array<number>) =>
      //   Promise.all(ids.map(id => getStakingData(id)))
      //     .then((results: Array<StakingData>) => setStakingInstances(results))
      //     .catch(console.error),
      // )
    } else if (viewMode === 'all') {
      Promise.all(new Array(count).fill(null).map((val, index) => getStakingDataById(index)))
        .then((results: Array<StakingData>) => setStakingInstances(results))
        .catch(console.error)
    }
  }, [contract, idToUse, account, accountToCheck, getStakingDataById, count, viewMode])

  useEffect(setupAllStaking, [setupAllStaking])

  useEffect(() => {
    setSortedStakingInstances(
      [...stakingInstances].sort(
        //
        (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0),
      ),
    )
  }, [stakingInstances])

  return (
    <Outer>
      <div className="bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 p-2 flex justify-center items-center">
        <Button
          className={`rounded-l-none rounded-r-none border-b-2 ${
            viewMode === 'split'
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent'
          }`}
          onClick={() => setViewMode('split')}
        >
          Split staking
        </Button>
        <Button
          className={`rounded-l-none rounded-r-none border-b-2 ${
            viewMode === 'all'
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent'
          }`}
          onClick={() => setViewMode('all')}
        >
          All ({count})
        </Button>
      </div>

      <MidSection>
        <SectionInner>
          {chainId && stakingEnabledOnNetwork && !stakingEnabledOnNetwork(chainId) ? (
            <div className="m-auto text-center flex flex-col gap-4">
              <div>
                <FontAwesomeIcon size="4x" icon={faSadTear} />
              </div>
              <div className="text-lg">Staking is not available on this network</div>
            </div>
          ) : account ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof idToUse !== 'undefined' &&
              sortedStakingInstances[0] &&
              parseInt(idToUse) === sortedStakingInstances[0].id ? (
                <div className="w-full md:max-w-md">
                  <Staking key={sortedStakingInstances[0].contractAddress} stakingData={sortedStakingInstances[0]} />
                </div>
              ) : // : !globalStakingData ? (
              //   <Loading>
              //     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              //       <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
              //     </motion.div>
              //   </Loading>
              // )
              viewMode === 'all' ? (
                <Grid>
                  {sortedStakingInstances.map((stakingData: StakingData) => (
                    <Staking key={stakingData.contractAddress} stakingData={stakingData} />
                  ))}
                </Grid>
              ) : viewMode === 'split' ? (
                <SplitStaking />
              ) : (
                // view mode not defined
                <></>
              )}
            </div>
          ) : (
            <NotConnected text="Connect your wallet to view staking." />
          )}
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

const StakingComponentWrapper: React.FC = () => {
  return (
    <StakingManagerV1ContractContextProvider>
      <SplitStakingV1ContractContextProvider>
        <StakingComponent />
      </SplitStakingV1ContractContextProvider>
    </StakingManagerV1ContractContextProvider>
  )
}

export default StakingComponentWrapper
