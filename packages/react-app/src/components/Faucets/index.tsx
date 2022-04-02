import React, { useEffect } from 'react'
import { useContractCache } from '../contracts/ContractCache'
// import { Primary as Button } from '../Button'
import { Outer, MidSection, SectionInner } from '../Layout'
import Faucet from './Faucet'

const FAUCETS: string[] = [
  // onlymoons faucet address
  '0x3C7687F9874f0281Ca734090CC0ED4a55E6bB8F3',
  // onlymoons/bnb lp faucet address
  '0x5eE93793ceb2803f1A1Bddd8823Cf2110eF142e4',
]

const Faucets: React.FC = () => {
  const { getContract } = useContractCache()

  useEffect(() => {}, [getContract])

  return (
    <Outer>
      <MidSection>
        <SectionInner>
          <div className="flex flex-col gap-8 items-center w-full">
            {FAUCETS.map((address) => (
              <Faucet key={address} address={address} />
            ))}
          </div>
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Faucets
