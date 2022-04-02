import React, { useEffect, useState } from 'react'
import DetailsCard from '../DetailsCard'
import { useContractCache } from '../contracts/ContractCache'
import { useUtilContract } from '../contracts/Util'
import { TokenData } from '../../typings'
import { BigNumber, Contract, utils } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Primary as Button } from '../Button'
import Anchor from '../Anchor'
import { getExplorerContractLink } from '../../util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

interface ClaimLimits {
  amount: BigNumber
  cooldown: BigNumber
}

export interface FaucetProps {
  address: string
}

const Faucet: React.FC<FaucetProps> = ({ address }) => {
  const { account, chainId } = useWeb3React()
  const { getContract } = useContractCache()
  const { contract: utilContract, getTokenData } = useUtilContract()
  const [contract, setContract] = useState<Contract>()
  const [tokenData, setTokenData] = useState<TokenData>()
  const [claimLimits, setClaimLimits] = useState<ClaimLimits>()
  const [lastClaim, setLastClaim] = useState<BigNumber>(BigNumber.from(0))
  const [nextClaim, setNextClaim] = useState<Date>()
  const [canClaim, setCanClaim] = useState<boolean>(false)
  const [claiming, setClaiming] = useState<boolean>(false)

  useEffect(() => {
    getContract('Faucet', { address })
      .then(setContract)
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [getContract, address])

  useEffect(() => {
    if (!contract || !getTokenData || !utilContract) {
      setTokenData(undefined)
      return
    }

    contract
      .token()
      .then((tokenAddress: string) => getTokenData(tokenAddress))
      .then(setTokenData)
      .catch((err: Error) => {
        console.error(err)
        setTokenData(undefined)
      })
  }, [contract, getTokenData, utilContract])

  useEffect(() => {
    if (!contract) {
      setClaimLimits(undefined)
      return
    }

    contract
      .getClaimLimits()
      .then(setClaimLimits)
      .catch((err: Error) => {
        console.error(err)
        setClaimLimits(undefined)
      })
  }, [contract])

  useEffect(() => {
    if (!contract || !account) {
      setLastClaim(BigNumber.from(0))
      return
    }

    contract
      .lastClaim(account)
      .then(setLastClaim)
      .catch((err: Error) => {
        console.error(err)
        setLastClaim(BigNumber.from(0))
      })
  }, [contract, account])

  useEffect(() => {
    if (!claimLimits) {
      setNextClaim(undefined)
      return
    }

    setNextClaim(new Date(lastClaim.add(claimLimits.cooldown).toNumber() * 1000))
  }, [claimLimits, lastClaim])

  useEffect(() => {
    if (!nextClaim) {
      setCanClaim(false)
      return
    }

    setCanClaim(nextClaim && nextClaim <= new Date())
  }, [nextClaim])

  return chainId && contract ? (
    <DetailsCard
      className=""
      headerContent={
        <div className="text-2xl w-full sm:w-96 flex justify-between items-center">
          <span>{tokenData?.name || '...'} </span>
          <Anchor target="_blank" rel="noopener noreferrer" href={getExplorerContractLink(chainId, contract.address)}>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Anchor>
        </div>
      }
      mainContent={
        <div className="flex flex-col gap-4">
          <Button
            disabled={!canClaim || claiming}
            onClick={() => {
              if (!contract) return

              setClaiming(true)

              contract
                .claim()
                .then((result: any) => result.wait())
                .catch(console.error)
                .then(() => setClaiming(false))
            }}
          >
            Claim {utils.commify(utils.formatUnits(claimLimits?.amount || BigNumber.from(0)))}
          </Button>

          {!canClaim && <div>Next claim: {nextClaim?.toLocaleString()}</div>}
        </div>
      }
    />
  ) : (
    <></>
  )
}

export default Faucet
