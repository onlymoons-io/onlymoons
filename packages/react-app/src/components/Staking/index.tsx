import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSadTear } from '@fortawesome/free-solid-svg-icons'
import SplitStakingV1ContractContextProvider from '../contracts/SplitStakingV1'
import StakingManagerV1ContractContextProvider, { useStakingManagerV1Contract } from '../contracts/StakingManagerV1'
import Staking from './Staking'
import NotConnected from '../NotConnected'
import { StakingData } from '../../typings'
import Button from '../Button'
import { Outer, MidSection, SectionInner, Grid } from '../Layout'
import SplitStaking from './SplitStaking'
import { usePromise } from 'react-use'
import CreateStaking from './Create'

export interface StakingProps {
  viewMode: 'split' | 'all' | 'deploy'
}

const StakingComponent: React.FC<StakingProps> = ({ viewMode }) => {
  const mounted = usePromise()
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { connector, chainId } = useWeb3React()
  const { stakingEnabledOnNetwork, contract, count, getStakingDataById } = useStakingManagerV1Contract()
  const [stakingInstances, setStakingInstances] = useState<Array<StakingData>>([])
  const [sortedStakingInstances, setSortedStakingInstances] = useState<Array<StakingData>>([])

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      //
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupAllStaking = useCallback(() => {
    if (!contract || !count || !getStakingDataById) {
      setStakingInstances([])
      return
    }

    if (idToUse) {
      mounted(getStakingDataById(parseInt(idToUse)))
        .then((result) => setStakingInstances([result]))
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
  }, [mounted, contract, idToUse, accountToCheck, getStakingDataById, count, viewMode])

  useEffect(setupAllStaking, [setupAllStaking])

  useEffect(() => {
    setSortedStakingInstances(
      [...stakingInstances].sort(
        //
        (a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0),
        // (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0),
      ),
    )
  }, [stakingInstances])

  return (
    <Outer>
      <div className="bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 p-2 flex justify-center items-center">
        <Link to="/staking">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              viewMode === 'split'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('split')}
          >
            Split staking
          </Button>
        </Link>

        <Link to="/staking/all">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              viewMode === 'all'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('all')}
          >
            All ({count})
          </Button>
        </Link>

        <Link to="/staking/deploy">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              viewMode === 'deploy'
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('all')}
          >
            Deploy
          </Button>
        </Link>
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
          ) : connector ? (
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
                  {/* <Button
                    className="flex flex-col gap-4 justify-center items-center border dark:border-gray-800"
                    style={{ minHeight: '200px' }}
                    onClick={() => setCurrentModal(<CreateStaking />)}
                  >
                    <FontAwesomeIcon icon={faPlus} size="3x" className="text-indigo-400" opacity={0.75} />

                    <div className="text-xl font-extralight">Deploy your own</div>
                  </Button> */}
                  {sortedStakingInstances.map((stakingData: StakingData) => (
                    <Staking key={stakingData.contractAddress} stakingData={stakingData} />
                  ))}
                </Grid>
              ) : viewMode === 'split' ? (
                <SplitStaking />
              ) : viewMode === 'deploy' ? (
                <div className="w-full max-w-md">
                  <CreateStaking />
                </div>
              ) : (
                // <div className="w-full flex justify-between items-start">
                //   <div className="shrink-0 w-full max-w-md">
                //     <CreateStaking />
                //   </div>

                //   <div className="flex-grow">Your staking contracts</div>
                // </div>
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

const StakingComponentWrapper: React.FC<StakingProps> = (props) => {
  return (
    <StakingManagerV1ContractContextProvider>
      <SplitStakingV1ContractContextProvider>
        <StakingComponent {...props} />
      </SplitStakingV1ContractContextProvider>
    </StakingManagerV1ContractContextProvider>
  )
}

export default StakingComponentWrapper
