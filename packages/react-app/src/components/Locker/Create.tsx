import React, { useEffect, useState, useContext, useCallback } from 'react'
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
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import { UtilContractContext } from '../contracts/Util'
import { ERC20ABI } from '../../contracts/external_contracts'
import { timestampToDateTimeLocal } from '../../util'
import Header from './Header'
import TokenInput from '../TokenInput'
import { Outer, MidSection, SectionInner } from '../Layout'

const { Web3Provider } = providers
const { isAddress } = utils

// const Outer = tw.div``

// const MidSection = tw.section`
//   bg-blue-500
//   dark:bg-blue-900
//   py-10
//   px-5
//   md:px-5
// `

// const SectionInner = tw.div`
//   container
//   m-auto
//   md:flex
//   justify-between
//   items-center
// `

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
  const navigate = useNavigate()
  const { account, chainId, connector } = useWeb3React()
  const { address: lockerManagerAddress, createTokenLocker } = useContext(TokenLockerManagerV1ContractContext)
  const { getTokenData, isLpToken, getLpData } = useContext(UtilContractContext)
  const [loadingTokenData, setLoadingTokenData] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<TokenData>()
  const [amount, setAmount] = useState<string>()
  // lock for 90 days by default
  const [unlockTime, setUnlockTime] = useState<number>(Math.ceil((Date.now() + 1000 * 60 * 60 * 24 * 90) / 1000))
  const [approved, setApproved] = useState<boolean>(false)
  const [contract, setContract] = useState<Contract>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(true)
  const [lpToken, setLpToken] = useState<boolean>(false)
  const [lpLockData, setLpLockData] = useState<LPLockData>()
  const [lpToken0Data, setLpToken0Data] = useState<TokenData>()
  const [lpToken1Data, setLpToken1Data] = useState<TokenData>()

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

        isLpToken(address)
          .then(result => setLpToken(result))
          .catch(() => setLpToken(false))

        getTokenData(address)
          .then(result => {
            setLoadingTokenData(false)
            setTokenData(result)
          })
          .catch(console.error)
      }
    },
    [getTokenData, isLpToken],
  )

  useEffect(() => {
    if (!lpToken || !tokenData || !getLpData) {
      setLpLockData(undefined)
      return
    }

    getLpData(tokenData.address)
      .then(lpData => setLpLockData(lpData))
      .catch(err => {
        console.error(err)
        setLpLockData(undefined)
      })
  }, [lpToken, tokenData, getLpData])

  useEffect(() => {
    if (!lpLockData || !getTokenData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    //
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

  useEffect(() => {
    if (!tokenData || !connector) {
      setContract(undefined)
      return
    }

    //
    connector
      .getProvider()
      .then(_provider => {
        //
        if (!_provider) return Promise.reject(new Error('Invalid provider'))

        setContract(new Contract(tokenData.address, ERC20ABI, new Web3Provider(_provider).getSigner()))
      })
      .catch(err => {
        console.error(err)
        setContract(undefined)
      })
  }, [tokenData, connector])

  const checkApproval = useCallback(() => {
    //
    if (!account || !contract || !lockerManagerAddress || !tokenData || !amount) {
      setApproved(false)
      return
    }

    //
    contract
      .allowance(account, lockerManagerAddress)
      .then((_allowance: BigNumber) => setApproved(_allowance.gte(utils.parseUnits(amount, tokenData.decimals))))
      .catch((err: Error) => {
        console.error(err)
        setApproved(false)
      })
  }, [account, contract, lockerManagerAddress, amount, tokenData])

  useEffect(checkApproval, [checkApproval])

  const onClickSubmit = useCallback(() => {
    //
    if (!account || !contract || !lockerManagerAddress || !amount || !tokenData || !createTokenLocker) {
      return console.log('not ready') // not ready
    }

    setIsSubmitting(true)
    setCanSubmit(false)

    if (approved) {
      // already approved. make the request
      createTokenLocker(tokenData.address, utils.parseUnits(amount, tokenData.decimals), unlockTime)
        .then((id: number) => {
          setCanSubmit(true)
          setIsSubmitting(false)
          navigate(`/locker/${chainId}/${id}`)
        })
        .catch(err => {
          console.error(err)
          setCanSubmit(true)
          setIsSubmitting(false)
        })
    } else {
      // not approved. send approval request first
      contract
        .approve(lockerManagerAddress, utils.parseUnits(amount, tokenData.decimals))
        .then((result: any) => result.wait())
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
  ])

  // useEffect(() => {
  //   setCanSubmit(BigNumber.from(amount || 0).gt(0))
  // }, [amount])

  return (
    <Outer className="text-gray-800 dark:text-gray-200">
      <Header filterEnabled={false} />

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

                    <TokenInput tokenData={tokenData} onChange={value => setAmount(value)} />

                    {/* <div className="flex gap-2 bg-white rounded">
                      <input
                        type="text"
                        className="flex-grow text-right bg-transparent text-gray-800 p-3 rounded text-xl outline-none"
                        ref={amountInputRef}
                        onInput={e => setAmount(e.currentTarget.value)}
                      />

                      <PrimaryButton
                        className="rounded-l-none text-gray-100"
                        onClick={() => {
                          //
                          if (amountInputRef.current) {
                            amountInputRef.current.value = utils.formatUnits(tokenData.balance, tokenData.decimals)
                            setAmount(amountInputRef.current.value)
                          }
                        }}
                      >
                        MAX
                      </PrimaryButton>
                    </div> */}

                    <div className="flex bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded items-center">
                      <div className="p-3 flex-shrink-0">Unlock time</div>
                      <input
                        type="datetime-local"
                        className="flex-grow p-3 outline-none bg-white dark:bg-gray-700 rounded-r"
                        defaultValue={timestampToDateTimeLocal(unlockTime)}
                        onInput={e => setUnlockTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
                      />
                    </div>

                    <PrimaryButton
                      className="py-4 text-gray-100"
                      disabled={!canSubmit || !amount}
                      onClick={onClickSubmit}
                    >
                      {isSubmitting ? (
                        <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />
                      ) : approved ? (
                        'Create lock'
                      ) : (
                        'Approve'
                      )}
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
