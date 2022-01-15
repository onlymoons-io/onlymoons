import React, { useState, useContext, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { utils } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Primary as PrimaryButton } from '../Button'
import Input from '../Input'
import { TokenData } from '../../typings'
import StakingManagerV1ContractContextProvider, { StakingManagerV1ContractContext } from '../contracts/StakingManagerV1'
import { UtilContractContext } from '../contracts/Util'
// import Header from './Header'
import { Outer, MidSection, SectionInner } from '../Layout'

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
  const navigate = useNavigate()
  const { chainId } = useWeb3React()
  const { createStaking } = useContext(StakingManagerV1ContractContext)
  const { getTokenData } = useContext(UtilContractContext)
  const [loadingTokenData, setLoadingTokenData] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<TokenData>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(true)
  const nameRef = useRef<HTMLInputElement>()

  const onInputAddress = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      //
      setTokenData(undefined)

      if (!e.currentTarget.value || !getTokenData) {
        setLoadingTokenData(false)
        return
      }

      setLoadingTokenData(true)

      if (isAddress(e.currentTarget.value)) {
        const address = e.currentTarget.value

        getTokenData(address)
          .then(result => {
            console.log(result)
            setLoadingTokenData(false)
            setTokenData(result)
          })
          .catch(console.error)
      }
    },
    [getTokenData],
  )

  const onClickSubmit = useCallback(() => {
    //
    if (!tokenData || !createStaking) {
      return console.log(createStaking) // not ready
    }

    setIsSubmitting(true)
    setCanSubmit(false)

    createStaking(tokenData.address, nameRef.current?.value || tokenData.symbol, 0)
      .then((id: number) => {
        setCanSubmit(true)
        setIsSubmitting(false)
        navigate(`/staking/${chainId}/${id}`)
      })
      .catch(err => {
        setCanSubmit(true)
        setIsSubmitting(false)
      })
  }, [tokenData, chainId, createStaking, navigate])

  return (
    <Outer>
      {/* <Header filterEnabled={false} /> */}

      <MidSection>
        <SectionInner>
          <div className="flex justify-center items-center w-full">
            <FormOuter>
              <div className="flex justify-between items-center">
                <StyledInput
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
                    </div>

                    <StyledInput placeholder="Staking instance name" defaultValue={tokenData.symbol} ref={nameRef} />

                    <PrimaryButton className="py-4 text-gray-100" disabled={!canSubmit} onClick={onClickSubmit}>
                      {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin /> : 'Create staking'}
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

const CreateWrapper: React.FC = () => {
  return (
    <StakingManagerV1ContractContextProvider>
      <Create />
    </StakingManagerV1ContractContextProvider>
  )
}

export default CreateWrapper
