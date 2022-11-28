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
import { TokenData /* LPLockData */ } from '../../typings'
import { useTokenLockerManagerContract } from '../contracts/TokenLockerManager'
import { useUtilContract } from '../contracts/Util'
import { NonfungiblePositionManagerABI } from '../../contracts/external_contracts'
import { getNetworkDataByChainId } from '../../util'
import Header from './Header'
import { Outer, MidSection, SectionInner } from '../Layout'
import { usePromise } from 'react-use'
import { useFeesContract } from '../contracts/Fees'
import { TotalFees } from './TotalFees'
import { UnlockTime } from './UnlockTime'

const { Web3Provider } = providers
const { isAddress /* formatEther, formatUnits, getAddress */ } = utils

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

interface TokenIdInfoOptions {
  active?: boolean
  tokenId: BigNumber
  contract?: Contract
  onClick?: () => void
}

const TokenIdInfo: React.FC<TokenIdInfoOptions> = ({ active = false, tokenId, contract, onClick }) => {
  const mounted = usePromise()
  const { getTokenData } = useUtilContract()
  const [token0, setToken0] = useState<string>()
  const [token1, setToken1] = useState<string>()
  const [token0Data, setToken0Data] = useState<TokenData>()
  const [token1Data, setToken1Data] = useState<TokenData>()

  useEffect(() => {
    if (!contract || !tokenId) {
      setToken0(undefined)
      setToken1(undefined)
      return
    }

    mounted<{ token0: string; token1: string }>(contract.positions(tokenId))
      .then((position) => {
        setToken0(position.token0)
        setToken1(position.token1)
      })
      .catch((err) => {
        console.error(err)
        setToken0(undefined)
        setToken1(undefined)
      })
  }, [mounted, contract, tokenId])

  useEffect(() => {
    if (!token0 || !getTokenData) {
      setToken0Data(undefined)
      return
    }

    mounted(getTokenData(token0))
      .then(setToken0Data)
      .catch((err) => {
        console.error(err)
        setToken0Data(undefined)
      })
  }, [mounted, token0, getTokenData])

  useEffect(() => {
    if (!token1 || !getTokenData) {
      setToken1Data(undefined)
      return
    }

    mounted(getTokenData(token1))
      .then(setToken1Data)
      .catch((err) => {
        console.error(err)
        setToken1Data(undefined)
      })
  }, [mounted, token1, getTokenData])

  return (
    <button
      className={`w-full p-2 border-2 rounded bg-indigo-500 bg-opacity-10 ${
        active ? 'border-indigo-500' : 'border-transparent'
      }`}
      type="button"
      onClick={onClick}
    >
      {token0Data && token1Data ? (
        <>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl">{token0Data.symbol}</span>
            <FontAwesomeIcon className="opacity-30" icon={faExchangeAlt} fixedWidth />
            <span className="text-xl">{token1Data.symbol}</span>
          </div>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faCircleNotch} spin={true} fixedWidth />
        </>
      )}
      <div className="italic">#{tokenId.toString()}</div>
    </button>
  )
}

const Create: React.FC = () => {
  const mounted = usePromise()
  const navigate = useNavigate()
  const { account, chainId, connector } = useWeb3React()
  const { address: lockerManagerAddress, createTokenLocker } = useTokenLockerManagerContract()
  const { getAdjustedFeeAmountForType } = useFeesContract()
  // const { getTokenData, isLpToken, getLpData } = useUtilContract()
  const [positionAddress, setPositionAddress] = useState<string>()
  const [tokenId, setTokenId] = useState<string>()
  const [loadingTokenData, setLoadingTokenData] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<TokenData>()
  // const [loadingPositionData, setLoadingPositionData] = useState<boolean>(false)
  // const [amount, setAmount] = useState<string>()
  // lock for 90 days by default
  // const [unlockTime, setUnlockTime] = useState<number>(Math.ceil((Date.now() + 1000 * 60 * 60 * 24 * 90) / 1000))
  const [unlockTime, setUnlockTime] = useState<number>()
  const [approved, setApproved] = useState<boolean>(false)
  const [contract, setContract] = useState<Contract>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(true)
  const [tokenIds, setTokenIds] = useState<Array<BigNumber>>()
  const [infiniteLock, setInfiniteLock] = useState<boolean>(false)
  const [totalFees, setTotalFees] = useState<BigNumber>()

  const isUnlockTimeValid = useCallback(() => {
    return infiniteLock ? true : unlockTime ? unlockTime * 1000 > Date.now() : false
  }, [unlockTime, infiniteLock])

  const getTokenIds = useCallback(async () => {
    if (!account || !contract) {
      setTokenIds(undefined)
      return
    }

    const balance = await mounted<BigNumber>(contract.balanceOf(account))
    const numTokens = balance.toNumber()

    setTokenIds(
      await Promise.all(
        new Array(numTokens).fill(null).map((_, index) =>
          mounted<BigNumber>(
            //
            contract.tokenOfOwnerByIndex(account, BigNumber.from(index)),
          ),
        ),
      ),
    )
  }, [mounted, account, contract])

  useEffect(() => {
    if (tokenIds?.length === 1) {
      setTokenId(tokenIds[0].toString())
    }
  }, [tokenIds])

  const onInputAddress = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    //
    // setTokenData(undefined)
    // setLpToken(false)

    if (!e.currentTarget.value) {
      setLoadingTokenData(false)
      setPositionAddress(undefined)
      return
    }

    setLoadingTokenData(true)

    if (isAddress(e.currentTarget.value)) {
      const address = e.currentTarget.value

      console.log(`check address ${address}`)

      setPositionAddress(address)

      // mounted(isLpToken(address))
      //   .then((result) => setLpToken(result))
      //   .catch(() => setLpToken(false))

      // mounted(getTokenData(address))
      //   .then((result) => {
      //     setLoadingTokenData(false)
      //     setTokenData(result)
      //   })
      //   .catch(console.error)
    } else {
      setPositionAddress(undefined)
    }
  }, [])

  useEffect(() => {
    if (!positionAddress || !connector) {
      setContract(undefined)
      return
    }

    //
    mounted(connector.getProvider())
      .then((_provider) => {
        //
        if (!_provider) return Promise.reject(new Error('Invalid provider'))

        setContract(
          new Contract(positionAddress, NonfungiblePositionManagerABI, new Web3Provider(_provider, 'any').getSigner()),
        )
      })
      .catch((err) => {
        console.error(err)
        setContract(undefined)
      })
  }, [mounted, positionAddress, connector])

  useEffect(() => {
    if (!contract) {
      setTokenId(undefined)
      setLoadingTokenData(false)
      setTokenData(undefined)
      setTokenIds(undefined)
      return
    }

    Promise.all([
      //
      contract.name() as string,
      contract.symbol() as string,
    ]).then(([name, symbol]) => {
      setLoadingTokenData(false)
      setTokenData({
        address: contract.address,
        name,
        symbol,
        decimals: 0,
        balance: BigNumber.from(0),
      })
      getTokenIds()
    })
  }, [contract, getTokenIds])

  const checkApproval = useCallback(() => {
    //
    if (!account || !contract || !lockerManagerAddress || !tokenData || !tokenId) {
      setApproved(false)
      return
    }

    //
    mounted<string>(contract.getApproved(tokenId))
      .then((_approved: string) => setApproved(_approved === lockerManagerAddress))
      .catch((err: Error) => {
        console.error(err)
        setApproved(false)
      })
  }, [mounted, account, contract, lockerManagerAddress, tokenId, tokenData])

  useEffect(checkApproval, [checkApproval])

  const onClickSubmit = useCallback(() => {
    if (
      !account ||
      !contract ||
      !lockerManagerAddress ||
      !tokenId ||
      !tokenData ||
      !createTokenLocker ||
      !isUnlockTimeValid()
    ) {
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
      mounted(createTokenLocker(tokenData.address, BigNumber.from(tokenId), _unlockTime, totalFees))
        .then((id: number) => {
          setCanSubmit(true)
          setIsSubmitting(false)
          navigate(`/locker/3/${getNetworkDataByChainId(chainId ?? 0)?.urlName || chainId}/${id}`)
        })
        .catch((err) => {
          console.error(err)
          setCanSubmit(true)
          setIsSubmitting(false)
        })
    } else {
      // not approved. send approval request first
      mounted(contract.approve(lockerManagerAddress, BigNumber.from(tokenId)))
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
    tokenId,
    lockerManagerAddress,
    tokenData,
    checkApproval,
    unlockTime,
    chainId,
    createTokenLocker,
    navigate,
    isUnlockTimeValid,
    infiniteLock,
    totalFees,
  ])

  // useEffect(() => {
  //   setCanSubmit(BigNumber.from(amount || 0).gt(0))
  // }, [amount])

  const getSubmitText = (): React.ReactNode => {
    if (isSubmitting) {
      return <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />
    }

    if (!tokenId) {
      return 'Select a tokenId'
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

  useEffect(() => {
    if (!getAdjustedFeeAmountForType) {
      setTotalFees(BigNumber.from(0))
      return
    }

    if (!infiniteLock) {
      setTotalFees(BigNumber.from(0))
      return
    }

    setTotalFees(undefined)

    mounted(getAdjustedFeeAmountForType('CreateInfiniteLock'))
      .then(setTotalFees)
      .catch((err) => {
        console.error(err)
        setTotalFees(BigNumber.from(0))
      })
  }, [mounted, infiniteLock, getAdjustedFeeAmountForType])

  return (
    <Outer className="text-gray-800 dark:text-gray-200">
      <Header lockType={3} filterEnabled={false} />

      <MidSection>
        <SectionInner>
          <div className="flex justify-center items-center w-full">
            <FormOuter>
              <div className="flex justify-between items-center">
                <AddressInput
                  className="flex-grow"
                  placeholder="Enter LP NFT address (NonFungiblePositionManager)"
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
                      <div>{tokenData.name}</div>
                      <div>({tokenData.symbol})</div>
                    </div>

                    <div className="flex flex-col gap-4 justify-center items-center w-full">
                      {tokenIds &&
                        tokenIds.map((_tokenId) => (
                          <TokenIdInfo
                            active={tokenId === _tokenId.toString()}
                            contract={contract}
                            tokenId={_tokenId}
                            key={_tokenId.toNumber()}
                            onClick={() => {
                              setTokenId(_tokenId.toString())
                            }}
                          />
                        ))}
                    </div>

                    {tokenId && (
                      <>
                        <UnlockTime onSetInfiniteLock={setInfiniteLock} onSetUnlockTime={setUnlockTime} />

                        <hr className="border-gray-500 border-opacity-20" />

                        <TotalFees onSetTotalFees={setTotalFees} infiniteLock={infiniteLock} />

                        <PrimaryButton
                          className="py-4 text-gray-100"
                          disabled={!canSubmit || !tokenId || !isUnlockTimeValid() || !totalFees}
                          onClick={onClickSubmit}
                        >
                          {getSubmitText()}
                        </PrimaryButton>
                      </>
                    )}
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
