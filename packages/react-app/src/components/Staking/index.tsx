import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSadTear } from '@fortawesome/free-solid-svg-icons'
import SplitStakingV1ContractContextProvider from '../contracts/SplitStakingV1'
import StakingManagerV1ContractContextProvider, { StakingManagerV1ContractContext } from '../contracts/StakingManagerV1'
import Staking from './Staking'
import NotConnected from '../NotConnected'
import { StakingData /*SplitStakingRewardsData, AllRewardsForAddress, StakingDataForAccount*/ } from '../../typings'
import Button from '../Button'
import { Outer, MidSection, SectionInner, Grid } from '../Layout'
import SplitStaking from './SplitStaking'
import { usePromise } from 'react-use'

// const { Web3Provider } = providers

const StakingComponent: React.FC = () => {
  const mounted = usePromise()
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { account, chainId } = useWeb3React()
  const { stakingEnabledOnNetwork, contract, count, getStakingDataById } = useContext(StakingManagerV1ContractContext)
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
      mounted(getStakingDataById(parseInt(idToUse)))
        .then(result => setStakingInstances([result]))
        .catch(console.error)
    } else if (accountToCheck) {
      // getTokenLockersForAddress(accountToCheck).then((ids: Array<number>) =>
      //   Promise.all(ids.map(id => getStakingData(id)))
      //     .then((results: Array<StakingData>) => setStakingInstances(results))
      //     .catch(console.error),
      // )
    } else if (viewMode === 'all') {
      mounted(Promise.all(new Array(count).fill(null).map((val, index) => getStakingDataById(index))))
        .then((results: Array<StakingData>) => setStakingInstances(results))
        .catch(console.error)
    }
  }, [mounted, contract, idToUse, account, accountToCheck, getStakingDataById, count, viewMode])

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
          {chainId && (!stakingEnabledOnNetwork || !stakingEnabledOnNetwork(chainId)) ? (
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
