import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun } from '@fortawesome/free-solid-svg-icons'
import { faSun as farSun } from '@fortawesome/free-regular-svg-icons'
import Button from './Button'
import Tooltip from './Tooltip'

const DarkModeToggle: React.FC = () => {
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(
    //
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    console.log('what')
    document.documentElement.classList.toggle('dark', darkModeEnabled)

    window.localStorage.setItem('OM_DARKMODE_ENABLED', darkModeEnabled ? '1' : '0')
  }, [darkModeEnabled])

  return (
    <>
      <Button
        onClick={() => setDarkModeEnabled(!darkModeEnabled)}
        data-tip={true}
        data-for="dark-mode"
        style={{ border: 'none !important', outline: 'none !important' }}
      >
        <FontAwesomeIcon icon={darkModeEnabled ? farSun : faSun} size="lg" opacity={0.8} />
      </Button>

      <Tooltip id="dark-mode" children="Toggle dark mode" />
    </>
  )
}

export default DarkModeToggle
