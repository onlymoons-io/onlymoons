import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, Contract, utils, providers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Primary as PrimaryButton } from '../Button'
import Input from '../Input'
import { TokenData, LPLockData } from '../../typings'
import { useTokenLockerManagerContract } from '../contracts/TokenLockerManager'
import { useUtilContract } from '../contracts/Util'
import { ERC20ABI } from '../../contracts/external_contracts'
import { getNetworkDataByChainId } from '../../util'
import Header from './Header'
import TokenInput from '../TokenInput'
import { Outer, MidSection, SectionInner } from '../Layout'
import { usePromise } from 'react-use'
import { UnlockTime } from './UnlockTime'
import { TotalFees } from './TotalFees'

const { Web3Provider } = providers
const { isAddress } = utils

const FormOuter = tw.div`
  bg-gray-100
  dark:bg-gray-800
  rounded
  p-4
  flex-grow
  max-w-lg
`

const AddressInputCSS = styled(Input)`
  padding: 1.25rem;
`

const AddressInput = tw(AddressInputCSS)`
  text-center
`

const Create: React.FC = () => {
  const mounted = usePromise()
  const navigate = useNavigate()
  const { account, chainId, connector } = useWeb3React()
  const { address: lockerManagerAddress, createTokenLocker } = useTokenLockerManagerContract()
  const { getTokenData, isLpToken, getLpData } = useUtilContract()
  const [loadingTokenData, setLoadingTokenData] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<TokenData>()
  const [amount, setAmount] = useState<string>()
  // lock for 90 days by default
  // const [unlockTime, setUnlockTime] = useState<number>(Math.ceil((Date.now() + 1000 * 60 * 60 * 24 * 90) / 1000))
  const [unlockTime, setUnlockTime] = useState<number>()
  const [approved, setApproved] = useState<boolean>(false)
  const [contract, setContract] = useState<Contract>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(true)
  const [infiniteLock, setInfiniteLock] = useState<boolean>(false)
  const [totalFees, setTotalFees] = useState<BigNumber>()
  const [lpToken, setLpToken] = useState<boolean>(false)
  const [lpLockData, setLpLockData] = useState<LPLockData>()
  const [lpToken0Data, setLpToken0Data] = useState<TokenData>()
  const [lpToken1Data, setLpToken1Data] = useState<TokenData>()

  const isUnlockTimeValid = useCallback(() => {
    return infiniteLock ? true : unlockTime ? unlockTime * 1000 > Date.now() : false
  }, [unlockTime, infiniteLock])

  const onInputAddress = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      //
      setTokenData(undefined)
      setLpToken(false)

      if (!e.currentTarget.value || !isLpToken || !getTokenData) {
        setLoadingTokenData(false)
        return
      }

      setLoadingTokenData(true)

      if (isAddress(e.currentTarget.value)) {
        const address = e.currentTarget.value

        mounted(isLpToken(address))
          .then((result) => setLpToken(result))
          .catch(() => setLpToken(false))

        mounted(getTokenData(address))
          .then((result) => {
            setLoadingTokenData(false)
            setTokenData(result)
          })
          .catch(console.error)
      }
    },
    [mounted, getTokenData, isLpToken],
  )

  useEffect(() => {
    if (!lpToken || !tokenData || !getLpData) {
      setLpLockData(undefined)
      return
    }

    mounted(getLpData<LPLockData>(tokenData.address))
      .then((lpData) => setLpLockData(lpData))
      .catch((err) => {
        console.error(err)
        setLpLockData(undefined)
      })
  }, [mounted, lpToken, tokenData, getLpData])

  useEffect(() => {
    if (!lpLockData || !getTokenData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    //
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
    if (!tokenData || !connector) {
      setContract(undefined)
      return
    }

    //
    mounted(connector.getProvider())
      .then((_provider) => {
        //
        if (!_provider) return Promise.reject(new Error('Invalid provider'))

        setContract(new Contract(tokenData.address, ERC20ABI, new Web3Provider(_provider, 'any').getSigner()))
      })
      .catch((err) => {
        console.error(err)
        setContract(undefined)
      })
  }, [mounted, tokenData, connector])

  const checkApproval = useCallback(() => {
    //
    if (!account || !contract || !lockerManagerAddress || !tokenData || !amount) {
      setApproved(false)
      return
    }

    //
    mounted<BigNumber>(contract.allowance(account, lockerManagerAddress))
      .then((_allowance: BigNumber) => setApproved(_allowance.gte(utils.parseUnits(amount, tokenData.decimals))))
      .catch((err: Error) => {
        console.error(err)
        setApproved(false)
      })
  }, [mounted, account, contract, lockerManagerAddress, amount, tokenData])

  useEffect(checkApproval, [checkApproval])

  const onClickSubmit = useCallback(() => {
    if (
      !account ||
      !contract ||
      !lockerManagerAddress ||
      !amount ||
      !tokenData ||
      !createTokenLocker ||
      // !unlockTime ||
      !isUnlockTimeValid()
    ) {
      // console.log('account', account)
      // console.log('contract', contract)
      // console.log('lockerManagerAddress', lockerManagerAddress)
      return console.log('not ready') // not ready
    }

    const _unlockTime = infiniteLock ? 0 : unlockTime ? unlockTime : undefined

    if (typeof _unlockTime === 'undefined') {
      return console.log('not ready')
    }

    setIsSubmitting(true)
    setCanSubmit(false)

    if (approved) {
      // already approved. make the request
      mounted(
        createTokenLocker(tokenData.address, utils.parseUnits(amount, tokenData.decimals), _unlockTime, totalFees),
      )
        .then((id: number) => {
          setCanSubmit(true)
          setIsSubmitting(false)
          navigate(`/locker/2/${getNetworkDataByChainId(chainId ?? 0)?.urlName || chainId}/${id}`)
        })
        .catch((err) => {
          console.error(err)
          setCanSubmit(true)
          setIsSubmitting(false)
        })
    } else {
      // not approved. send approval request first
      mounted(contract.approve(lockerManagerAddress, utils.parseUnits(amount, tokenData.decimals)))
        .then((result: any) => mounted(result.wait()))
        .then((tx: any) => {
          checkApproval()
          setCanSubmit(true)
          setIsSubmitting(false)
        })
        .catch((err: Error) => {
          console.error(err)
          setCanSubmit(true)
          setIsSubmitting(false)
        })
    }
  }, [
    mounted,
    account,
    approved,
    contract,
    amount,
    lockerManagerAddress,
    tokenData,
    checkApproval,
    unlockTime,
    chainId,
    createTokenLocker,
    navigate,
    isUnlockTimeValid,
    totalFees,
    infiniteLock,
  ])

  // useEffect(() => {
  //   setCanSubmit(BigNumber.from(amount || 0).gt(0))
  // }, [amount])

  const getSubmitText = (): React.ReactNode => {
    if (isSubmitting) {
      return <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />
    }

    if (!amount) {
      return 'Select an amount'
    }

    if (!isUnlockTimeValid()) {
      return 'Select an unlock time'
    }

    if (unlockTime && unlockTime * 1000 < Date.now()) {
      return 'Unlock time must be in the future'
    }

    if (!totalFees) {
      return 'Calculating fees...'
    }

    return approved ? 'Create lock' : 'Approve'
  }

  return (
    <Outer className="text-gray-800 dark:text-gray-200">
      <Header lockType={2} filterEnabled={false} />

      <MidSection>
        <SectionInner>
          <div className="flex justify-center items-center w-full">
            <FormOuter>
              <div className="flex justify-between items-center">
                <AddressInput
                  className="flex-grow"
                  placeholder="Enter liquidity pair or token address"
                  onInput={onInputAddress}
                />
              </div>

              {loadingTokenData ? (
                <>
                  {/* <Divider /> */}

                  <div className="flex justify-center items-center mt-10">
                    <FontAwesomeIcon size="4x" icon={faCircleNotch} spin={true} className="text-blue-300" />
                  </div>
                </>
              ) : tokenData ? (
                <div className=" p-3 rounded mt-4">
                  {/* <Divider /> */}

                  <div className="flex flex-col gap-6 mt-3">
                    <div className="text-2xl font-extralight text-center">
                      {tokenData.name} ({tokenData.symbol})
                      {lpToken0Data && lpToken1Data && (
                        <div className="flex gap-1 justify-center items-center">
                          <span>{lpToken0Data.symbol}</span>
                          <FontAwesomeIcon icon={faExchangeAlt} size="sm" fixedWidth opacity={0.5} />
                          <span>{lpToken1Data.symbol}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      Your balance:
                      <br />
                      <b>{utils.commify(utils.formatUnits(tokenData.balance, tokenData.decimals))}</b>
                    </div>

                    <TokenInput tokenData={tokenData} onChange={(value) => setAmount(value)} />

                    <UnlockTime onSetInfiniteLock={setInfiniteLock} onSetUnlockTime={setUnlockTime} />

                    <hr className="border-gray-500 border-opacity-20" />

                    <TotalFees onSetTotalFees={setTotalFees} infiniteLock={infiniteLock} />

                    <PrimaryButton
                      className="py-4 text-gray-100"
                      disabled={!canSubmit || !amount || !isUnlockTimeValid()}
                      onClick={onClickSubmit}
                    >
                      {getSubmitText()}
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <>{/*  */}</>
              )}
            </FormOuter>
          </div>
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Create
