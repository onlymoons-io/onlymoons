import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
// import { utils } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  faBalanceScale,
  faBalanceScaleLeft,
  faBalanceScaleRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { StakingManagerV1ContractContext } from '../contracts/StakingManagerV1'
import Staking from './Staking'
import NotConnected from '../NotConnected'
import { StakingData /*StakingDataForAccount*/ } from '../../typings'
import Header from './Header'
import Button, { Primary as PrimaryButton } from '../Button'
import { Outer, MidSection, SectionInner, Grid, Loading } from '../Layout'

// const { isAddress } = utils

const StakingComponent: React.FC = () => {
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { account, chainId } = useWeb3React()
  const { contract, count, globalStakingData, getStakingData } = useContext(StakingManagerV1ContractContext)
  const [stakingInstances, setStakingInstances] = useState<Array<StakingData>>([])
  const [sortedStakingInstances, setSortedStakingInstances] = useState<Array<StakingData>>([])
  const [filterInputValue, setFilterInputValue] = useState<string>()
  const [soloStakingData, setSoloStakingData] = useState<StakingData>()
  const [lpStakingData, setLpStakingData] = useState<StakingData>()
  const [viewMode, setViewMode] = useState<'split' | 'all'>('split')

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      //
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupAllStaking = useCallback(() => {
    if (!contract || !account || !count || !getStakingData) {
      setStakingInstances([])
      return
    }

    if (idToUse) {
      getStakingData(parseInt(idToUse))
        .then(result => setStakingInstances([result]))
        .catch(console.error)
    } else if (accountToCheck) {
      // getTokenLockersForAddress(accountToCheck).then((ids: Array<number>) =>
      //   Promise.all(ids.map(id => getStakingData(id)))
      //     .then((results: Array<StakingData>) => setStakingInstances(results))
      //     .catch(console.error),
      // )
    } else if (filterInputValue) {
      setStakingInstances([])
      // if (isAddress(filterInputValue)) {
      //   getTokenLockersForAddress(filterInputValue).then((ids: Array<number>) =>
      //     Promise.all(ids.map(id => getStakingData(id)))
      //       .then((results: Array<StakingData>) => setStakingInstances(results))
      //       .catch(console.error),
      //   )
      // }
    } else if (viewMode === 'all') {
      Promise.all(new Array(count).fill(null).map((val, index) => getStakingData(index)))
        .then((results: Array<StakingData>) => setStakingInstances(results))
        .catch(console.error)
    }
  }, [contract, idToUse, account, accountToCheck, getStakingData, count, filterInputValue, viewMode])

  useEffect(setupAllStaking, [setupAllStaking])

  useEffect(() => {
    setSortedStakingInstances(
      [...stakingInstances].sort(
        //
        (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0),
      ),
    )
  }, [stakingInstances])

  useEffect(() => {
    if (!getStakingData || !globalStakingData?.ready) {
      setSoloStakingData(undefined)
      setLpStakingData(undefined)
      return
    }

    // console.log(globalStakingData)

    //
    Promise.all([getStakingData(globalStakingData.soloStakingId), getStakingData(globalStakingData.lpStakingId)])
      .then(([_soloStakingData, _lpStakingData]) => {
        setSoloStakingData(_soloStakingData)
        setLpStakingData(_lpStakingData)
      })
      .catch(err => {
        console.error(err)
      })
  }, [getStakingData, globalStakingData])

  return (
    <Outer>
      {/* <Header filterEnabled={idToUse || accountToCheck ? false : true} onFilterInput={setFilterInputValue} /> */}

      <div className="dark:bg-gray-800 p-2 flex justify-center items-center">
        <Button
          className={`rounded-l-none rounded-r-none border-b-2 ${
            viewMode === 'split' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent'
          }`}
          onClick={() => setViewMode('split')}
        >
          Split staking
        </Button>
        <Button
          className={`rounded-l-none rounded-r-none border-b-2 ${
            viewMode === 'all' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent'
          }`}
          onClick={() => setViewMode('all')}
        >
          All ({count})
        </Button>
      </div>

      <MidSection>
        <SectionInner>
          {account ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof idToUse !== 'undefined' &&
              sortedStakingInstances[0] &&
              parseInt(idToUse) === sortedStakingInstances[0].id ? (
                <div className="w-full md:max-w-md">
                  <Staking key={sortedStakingInstances[0].name} stakingData={sortedStakingInstances[0]} />
                </div>
              ) : !globalStakingData ? (
                <Loading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </Loading>
              ) : viewMode === 'all' ? (
                <Grid>
                  {sortedStakingInstances.map((stakingData: StakingData) => (
                    <Staking key={stakingData.name} stakingData={stakingData} />
                  ))}
                </Grid>
              ) : viewMode === 'split' ? (
                <>
                  <div className="text-2xl">Split staking</div>

                  <p className="text-center">
                    Rewards ratio for split staking is automated depending on what's most needed.
                    <br />
                    Below 10% liquidity to market cap ratio favors LP staking, above 10% favors solo staking.
                  </p>

                  {globalStakingData?.ready ? (
                    soloStakingData && lpStakingData ? (
                      <div className="w-full lg:grid-flow-col-dense grid gap-4 max-w-5xl mt-4">
                        <Staking
                          // className={`${
                          //   globalStakingData.rewardsRatio > 5000
                          //     ? 'border-green-500 lg:border-r-4'
                          //     : 'border-transparent'
                          // } border-b-4 lg:border-b-0`}
                          stakingData={soloStakingData}
                          startExpanded={false}
                        />

                        {/* <div className="flex items-center justify-center mx-8 my-4">
                          <div className="flex flex-col gap-3 items-center">
                            <FontAwesomeIcon
                              opacity={0.5}
                              className="text-4xl md:text-3xl lg:text-5xl"
                              icon={
                                globalStakingData.rewardsRatio < 5000
                                  ? faBalanceScaleRight
                                  : globalStakingData.rewardsRatio > 5000
                                  ? faBalanceScaleLeft
                                  : faBalanceScale
                              }
                            />

                            {globalStakingData.rewardsRatio !== 5000 && (
                              <>
                                <span className="text-center">
                                  Favors {globalStakingData.rewardsRatio < 5000 ? 'LP' : 'Solo'} by{' '}
                                </span>
                                <span className="text-center text-xl">
                                  {(Math.abs(5000 - globalStakingData.rewardsRatio) / 10 ** 2) * 2}%
                                </span>
                              </>
                            )}
                          </div>
                        </div> */}

                        <Staking
                          // className={`${
                          //   globalStakingData.rewardsRatio < 5000
                          //     ? 'border-green-500 lg:border-l-4'
                          //     : 'border-transparent'
                          // } border-t-4 lg:border-t-0`}
                          stakingData={lpStakingData}
                          startExpanded={false}
                        />
                      </div>
                    ) : (
                      <div>Staking data is loading</div>
                    )
                  ) : (
                    <div>Staking data is not ready</div>
                  )}
                </>
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

export default StakingComponent
