import React, { FormEvent, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faExchangeAlt, faInfoCircle, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, utils } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Light as LightButton, Primary as PrimaryButton } from '../Button'
import Input from '../Input'
import { LPData, TokenData } from '../../typings'
import StakingManagerV1ContractContextProvider, { useStakingManagerV1Contract } from '../contracts/StakingManagerV1'
import { useNotifications } from '../NotificationCatcher'
import { useUtilContract } from '../contracts/Util'
import { usePromise } from 'react-use'
import DetailsCard from '../DetailsCard'
import Select from '../Select'
import { getNativeCoin } from '../../util'
import { motion } from 'framer-motion'
import TokenWithValue from '../TokenWithValue'
import AddressLink from '../AddressLink'
import NotConnected from '../NotConnected'

const { isAddress } = utils

const FormOuter = tw.div`
  dark:bg-gray-800
  rounded
  p-4
  flex-grow
  max-w-lg
`

const InputCSS = styled(Input)`
  padding: 1.25rem;
`

const StyledInput = tw(InputCSS)`
  bg-white
  dark:bg-gray-700
  dark:text-gray-200
`

const Create: React.FC = () => {
  const mounted = usePromise()
  const navigate = useNavigate()
  const { account, chainId } = useWeb3React()
  const { createStaking, getFeeAmountForType } = useStakingManagerV1Contract()
  const { push: pushNotification } = useNotifications()
  const { getTokenData, getLpData } = useUtilContract()
  const [loadingTokenData, setLoadingTokenData] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<TokenData>()
  const [lpData, setLpData] = useState<LPData>()
  const [lpToken0Data, setLpToken0Data] = useState<TokenData>()
  const [lpToken1Data, setLpToken1Data] = useState<TokenData>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [stakingType, setStakingType] = useState<number>(0)
  const [feeAmount, setFeeAmount] = useState<BigNumber>()
  const [formPage, setFormPage] = useState<number>(0)
  const [rewardsTokenData, setRewardsTokenData] = useState<TokenData>()
  const [loadingRewardsTokenData, setLoadingRewardsTokenData] = useState<boolean>(false)
  const [rewardsRate, setRewardsRate] = useState<BigNumber>(BigNumber.from(0))
  const [instantRewards, setInstantRewards] = useState<boolean>(true)

  const updateTokenData = useCallback(
    (address?: string) => {
      //
      setTokenData(undefined)
      setLpData(undefined)

      if (!address || !getTokenData || !getLpData) {
        setLoadingTokenData(false)
        return
      }

      setLoadingTokenData(true)

      if (!isAddress(address)) return

      mounted(
        Promise.all([
          getTokenData(address),
          // wrap the call in a promise because we want it to fail silently.
          new Promise<LPData | undefined>((resolve) =>
            getLpData(address)
              .then(resolve)
              .catch(() => resolve(undefined)),
          ),
        ]),
      )
        .then(([_tokenData, _lpData]) => {
          setTokenData(_tokenData)
          setLpData(_lpData)
        })
        .catch((err) => {
          err && pushNotification && pushNotification(err)
          setTokenData(undefined)
          setLpData(undefined)
        })
        .then(() => setLoadingTokenData(false))
    },
    [mounted, getTokenData, getLpData, pushNotification],
  )

  const updateRewardsTokenData = useCallback(
    (address?: string) => {
      //
      setRewardsTokenData(undefined)

      if (!address || !getTokenData || !getLpData) {
        setLoadingRewardsTokenData(false)
        return
      }

      setLoadingRewardsTokenData(true)

      if (!isAddress(address)) return

      mounted(getTokenData(address))
        .then(setRewardsTokenData)
        .catch((err) => {
          err && pushNotification && pushNotification(err)
          setRewardsTokenData(undefined)
        })
        .then(() => setLoadingRewardsTokenData(false))
    },
    [mounted, getTokenData, getLpData, pushNotification],
  )

  const onInputAddress = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      //
      updateTokenData(e.currentTarget.value)
    },
    [updateTokenData],
  )

  const onInputRewardsTokenAddress = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      //
      updateRewardsTokenData(e.currentTarget.value)
    },
    [updateRewardsTokenData],
  )

  const onInputRewardsRate = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      if (!rewardsTokenData || !e.currentTarget.value || e.currentTarget.value === '') {
        setRewardsRate(BigNumber.from(0))
        return
      }

      try {
        setRewardsRate(utils.parseUnits(e.currentTarget.value, rewardsTokenData.decimals))
      } catch (err) {
        console.error(err)
      }
    },
    [rewardsTokenData],
  )

  const onClickSubmit = useCallback(() => {
    //
    if (!tokenData || !createStaking) {
      return console.log(createStaking) // not ready
    }

    setIsSubmitting(true)

    mounted(
      createStaking(
        stakingType,
        tokenData.address,
        undefined,
        stakingType === 1 && rewardsTokenData ? [BigNumber.from(rewardsTokenData.address)] : undefined,
      ),
    )
      .then((id: number) => {
        setIsSubmitting(false)
        navigate(`/staking/${chainId}/${id}`)
      })
      .catch((err) => {
        setIsSubmitting(false)
        pushNotification && pushNotification(err)
      })
  }, [mounted, tokenData, chainId, createStaking, navigate, pushNotification, stakingType, rewardsTokenData])

  useEffect(() => {
    setFeeAmount(undefined)

    if (!chainId || !account || !getFeeAmountForType) return

    mounted(getFeeAmountForType('DeployStaking'))
      .then(setFeeAmount)
      .catch((err: Error) => {
        console.error(err)
        setFeeAmount(undefined)
      })
  }, [mounted, chainId, account, stakingType, getFeeAmountForType])

  useEffect(() => {
    setRewardsRate(BigNumber.from(0))

    if (!chainId) {
      setRewardsTokenData(undefined)
      return
    }

    switch (stakingType) {
      case 0:
        setRewardsTokenData(getNativeCoin(chainId))
        break
      case 1:
      default:
        setRewardsTokenData(undefined)
        break
    }
  }, [chainId, mounted, stakingType])

  useEffect(() => {
    if (!lpData || !getTokenData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    mounted(Promise.all([getTokenData(lpData.token0), getTokenData(lpData.token1)]))
      .then(([_lpToken0Data, _lpToken1Data]) => {
        setLpToken0Data(_lpToken0Data)
        setLpToken1Data(_lpToken1Data)
      })
      .catch((err) => {
        err && pushNotification && pushNotification(err)
      })
  }, [mounted, lpData, getTokenData, pushNotification])

  if (!chainId) return null

  if (!account) return <NotConnected text="Connect your wallet to deploy a staking contract." />

  return (
    <DetailsCard
      className="w-full"
      innerClassName="overflow-auto"
      style={{ margin: 'auto', maxWidth: '90vw', maxHeight: '70vh' }}
      headerContent={
        <div className="flex justify-between items-center">
          <span className="text-xl">Deploy staking contract</span>

          {/* <Button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} />
          </Button> */}
        </div>
      }
      mainContent={
        <div className="w-full h-96 overflow-auto">
          <div className="sticky top-0 dark:bg-gray-800">
            <div className="p-2 bg-gray-200 bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 rounded grid grid-cols-4 gap-1 divide-x divide-gray-200 dark:divide-gray-800">
              <div
                className={`p-2 text-center overflow-hidden text-ellipsis ${
                  formPage === 0 ? 'text-indigo-700 dark:text-indigo-300' : ''
                }`}
              >
                {tokenData?.symbol ?? 'Token'}
              </div>
              <div
                className={`p-2 text-center overflow-hidden text-ellipsis ${
                  formPage === 1 ? 'text-indigo-700 dark:text-indigo-300' : ''
                } ${formPage < 1 ? 'opacity-30' : ''}`}
              >
                Contract
              </div>
              <div
                className={`p-2 text-center overflow-hidden text-ellipsis ${
                  formPage === 2 ? 'text-indigo-700 dark:text-indigo-300' : ''
                } ${formPage < 2 ? 'opacity-30' : ''}`}
              >
                Options
              </div>
              <div
                className={`p-2 text-center overflow-hidden text-ellipsis ${
                  formPage === 3 ? 'text-indigo-700 dark:text-indigo-300' : ''
                } ${formPage < 3 ? 'opacity-30' : ''}`}
              >
                Deploy
              </div>
            </div>
          </div>

          <FormOuter>
            {(() => {
              switch (formPage) {
                case 0:
                  return (
                    <div className="">
                      <div className="flex flex-col gap-3 w-full">
                        <div>Staking token</div>
                        <StyledInput
                          className="flex-grow"
                          placeholder="Enter liquidity pair or token address"
                          autoFocus={true}
                          defaultValue={tokenData?.address}
                          onInput={onInputAddress}
                        />
                      </div>

                      {tokenData && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-8 font-extralight text-center"
                        >
                          <div className="text-2xl font-extralight">
                            {tokenData.name} ({tokenData.symbol})
                          </div>

                          {lpData && lpToken0Data && lpToken1Data ? (
                            <div className="mt-3 grid grid-cols-3 text-center">
                              <div className="flex flex-col gap-2">
                                <div>
                                  <div>
                                    <div>{lpToken0Data.name}</div>
                                    <div>({lpToken0Data.symbol})</div>
                                  </div>
                                  <AddressLink address={lpData.token0} />
                                </div>
                                <div></div>
                              </div>
                              <FontAwesomeIcon className=" m-auto" icon={faExchangeAlt} opacity={0.5} />
                              <div className="flex flex-col gap-2">
                                <div>
                                  <div>
                                    <div>{lpToken1Data.name}</div>
                                    <div>({lpToken1Data.symbol})</div>
                                  </div>
                                  <AddressLink address={lpData.token1} />
                                </div>
                                <div></div>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </motion.div>
                      )}

                      {loadingTokenData && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center mt-8"
                        >
                          <FontAwesomeIcon size="2x" icon={faCircleNotch} spin={true} className="text-blue-300" />
                        </motion.div>
                      )}
                    </div>
                  )
                case 1:
                  return !tokenData ? (
                    <></>
                  ) : (
                    <div className="">
                      <div className="flex flex-col gap-3">
                        {/* <div className="font-extralight flex gap-4 items-center">
                            <span>
                              {tokenData.name} ({tokenData.symbol})
                            </span>
                            <AddressLink address={tokenData.address} />
                          </div> */}

                        <div>Select a staking contract type</div>

                        <Select
                          defaultValue={stakingType}
                          name="stakingType"
                          options={[
                            {
                              label: `${getNativeCoin(chainId || 0).symbol} reflection`,
                              value: 0,
                            },
                            {
                              label: 'Token reflection',
                              value: 1,
                            },
                          ]}
                          autoFocus={true}
                          onChange={(e) => setStakingType(parseInt(e.currentTarget.value))}
                        />

                        <div className="dark:bg-indigo-500 dark:bg-opacity-20 p-4 rounded flex justify-between items-center gap-4">
                          <FontAwesomeIcon icon={faInfoCircle} size="lg" fixedWidth />
                          <div>
                            <p>
                              Reflects {stakingType === 0 ? getNativeCoin(chainId || 0).symbol : 'specified token'} to
                              staking accounts, in proportion to their weight in the pool.
                            </p>

                            {/* <p className="mt-3">Features auto-claim rewards &amp; optional lock duration.</p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                case 2:
                  return (
                    <div className="flex flex-col gap-2">
                      {/* <div>Configure your staking contract</div> */}

                      {/* <hr className="border-gray-200 dark:border-gray-700 opacity-50" /> */}

                      <div className="flex flex-col gap-3 w-full">
                        {stakingType === 1 ? (
                          <>
                            <div className="flex justify-between items-center gap-4">
                              <span>Rewards token:</span>
                              <Input
                                className="shrink-0 w-2/3"
                                placeholder="Enter rewards token address"
                                defaultValue={rewardsTokenData?.address}
                                onInput={onInputRewardsTokenAddress}
                              />
                            </div>

                            <div className="w-2/3 self-end px-4 font-extralight">
                              {rewardsTokenData ? (
                                <>
                                  {rewardsTokenData.name} ({rewardsTokenData.symbol})
                                </>
                              ) : loadingRewardsTokenData ? (
                                <FontAwesomeIcon icon={faCircleNotch} spin={true} />
                              ) : (
                                <span className="text-red-500">Enter a valid token address</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <></>
                        )}

                        {rewardsTokenData && (
                          <>
                            <div className="flex justify-between items-start gap-4">
                              <span>Rewards rate:</span>

                              <div className="shrink-0 w-2/3 flex flex-col gap-2">
                                <label className="shrink-0 w-2/3 flex gap-2 items-center">
                                  <input
                                    type="checkbox"
                                    defaultChecked={instantRewards}
                                    onChange={(e) => setInstantRewards(e.currentTarget.checked)}
                                  />
                                  <span>Instant</span>
                                </label>

                                {!instantRewards && (
                                  <Input
                                    className="w-full"
                                    placeholder="Amount released per day"
                                    disabled={instantRewards}
                                    autoFocus={true}
                                    defaultValue={
                                      rewardsRate.eq(0) ? '' : utils.formatUnits(rewardsRate, rewardsTokenData.decimals)
                                    }
                                    onInput={onInputRewardsRate}
                                  />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                case 3:
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span>Staked token:</span>
                        <span>
                          {tokenData?.name ?? '...'} ({tokenData?.symbol ?? '...'})
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Contract type:</span>
                        <span>
                          {stakingType === 0
                            ? `${getNativeCoin(chainId || 0).symbol} reflection`
                            : stakingType === 1
                            ? 'Token reflection'
                            : 'Invalid'}
                        </span>
                      </div>

                      {rewardsTokenData && (
                        <>
                          <div className="flex justify-between">
                            <span>Rewards in:</span>
                            <span>
                              {rewardsTokenData.name} ({rewardsTokenData.symbol})
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Rewards rate:</span>
                            <span>
                              {instantRewards || rewardsRate.eq(0) ? (
                                <>Instant</>
                              ) : (
                                <>
                                  {utils.formatUnits(rewardsRate, rewardsTokenData.decimals)} {rewardsTokenData.symbol}{' '}
                                  per day
                                </>
                              )}
                            </span>
                          </div>
                        </>
                      )}

                      <hr className="border-gray-200 dark:border-gray-700" />

                      <div className="flex justify-between">
                        <span>Deploy fee:</span>
                        <span>
                          {tokenData && feeAmount ? (
                            <TokenWithValue amount={feeAmount} tokenData={getNativeCoin(chainId || 0)} />
                          ) : (
                            <>...</>
                          )}
                        </span>
                      </div>
                    </div>
                  )
              }
            })()}
          </FormOuter>
        </div>
      }
      footerContent={
        <div className="grid grid-cols-2 gap-2">
          <LightButton onClick={() => setFormPage(Math.max(formPage - 1, 0))} disabled={formPage === 0}>
            <FontAwesomeIcon icon={faLongArrowAltLeft} opacity={0.25} fixedWidth /> Back
          </LightButton>

          <PrimaryButton
            disabled={(() => {
              if (!tokenData || isSubmitting) return true

              switch (formPage) {
                default:
                  return false
                case 2:
                  if (!rewardsTokenData) return true
                  if (!instantRewards && rewardsRate.eq(0)) return true
                  return false
              }
            })()}
            onClick={formPage === 3 ? onClickSubmit : () => setFormPage(formPage + 1)}
          >
            {isSubmitting ? (
              <>
                Deploying <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />
              </>
            ) : formPage === 3 ? (
              <>Deploy</>
            ) : (
              <>Next</>
            )}
          </PrimaryButton>
        </div>
      }
    />
  )
}

const CreateWrapper: React.FC = () => {
  return (
    <StakingManagerV1ContractContextProvider>
      <Create />
    </StakingManagerV1ContractContextProvider>
  )
}

export default CreateWrapper
