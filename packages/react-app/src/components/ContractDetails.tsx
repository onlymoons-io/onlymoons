import React, { CSSProperties, useContext, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { providers } from 'ethers'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import CodeViewer from './CodeViewer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faFileCode, faTimes } from '@fortawesome/free-solid-svg-icons'
import { ModalControllerContext } from './ModalController'
import { Light as Button } from './Button'
import CopyButton from './CopyButton'
// import { getExplorerAddressLink } from '../util'

const { Web3Provider } = providers

const OuterCSS = styled.div`
  width: 80vw;
  height: 80vh;
`

const Outer = tw(OuterCSS)`
  bg-gray-100
  dark:bg-gray-800
  text-gray-800
  dark:text-gray-200
  p-2
  rounded
  flex
  flex-col
`

const Header = tw.div`
  p-2
  flex
  gap-2
  justify-between
  items-center
`

const Inner = tw.div`
  flex
  flex-col
  gap-4
  p-2
  overflow-auto
  max-h-full
`

export interface ContractDetailsProps {
  address: string
  abi?: string
  className?: string
  style?: CSSProperties
}

const ContractDetails: React.FC<ContractDetailsProps> = ({ children, address, abi, className = '', style = {} }) => {
  const { chainId, connector } = useWeb3React()
  const { closeModal } = useContext(ModalControllerContext)
  const [bytecode, setBytecode] = useState<string>()

  useEffect(() => {
    if (!connector) {
      setBytecode(undefined)
      return
    }

    connector
      .getProvider()
      .then(provider => new Web3Provider(provider).getCode(address))
      // remove the first 2 characters if they are 0x (they should be)
      .then(result => (result.startsWith('0x') ? result.substring(2) : result))
      .then(setBytecode)
      .catch((err: Error) => {
        console.error(err)
        setBytecode(undefined)
      })
  }, [connector, address])

  return (
    <Outer className={className} style={style}>
      <Header>
        <div className="text-2xl font-bold whitespace-nowrap overflow-hidden flex gap-2 items-center">
          <FontAwesomeIcon icon={faFileCode} className="mr-1" />
          <span className="flex-shrink overflow-hidden overflow-ellipsis">{address}</span>
          <CopyButton className="text-base" text={address} />
        </div>

        <Button onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </Button>
      </Header>

      <Inner>
        <div>It's recommended to save both the lock contract address and ABI in case access to this is lost.</div>

        {chainId === 1088 && (
          <div className="mx-auto flex items-center gap-4 bg-red-400 bg-opacity-30 dark:bg-red-900 dark:bg-opacity-30 p-4 rounded w-full">
            <FontAwesomeIcon className="text-red-500" icon={faExclamationTriangle} size="2x" fixedWidth />
            <div>
              Lock contracts are currently not able to be verified on the Metis block explorer. Saving the address and
              ABI is especially important here until this is resolved.
            </div>
          </div>
        )}

        {abi && <CodeViewer title="ABI" className="flex-grow" children={abi} />}

        {bytecode && <CodeViewer title="Bytecode" children={bytecode} />}
      </Inner>
    </Outer>
  )
}

export default ContractDetails
