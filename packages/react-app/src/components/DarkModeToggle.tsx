import React, { useState, useEffect, CSSProperties } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
// import { faSun as farSun } from '@fortawesome/free-regular-svg-icons'
import Button from './Button'
import Tooltip from './Tooltip'

export interface DarkModeToggleProps {
  className?: string
  style?: CSSProperties
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '', style = {} }) => {
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(
    //
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    // toggle main dark mode class - tailwind picks up on this
    document.documentElement.classList.toggle('dark', darkModeEnabled)

    // toggle light & dark mode classes on html element
    document.documentElement.classList.toggle('bg-gray-900', darkModeEnabled)
    document.documentElement.classList.toggle('bg-gray-200', !darkModeEnabled)

    // store preference in localStorage
    window.localStorage.setItem('OM_DARKMODE_ENABLED', darkModeEnabled ? '1' : '0')
  }, [darkModeEnabled])

  return (
    <>
      <Button
        onClick={() => setDarkModeEnabled(!darkModeEnabled)}
        data-tip={true}
        data-for="dark-mode"
        className={className}
        style={{ ...style, border: 'none !important', outline: 'none !important' }}
      >
        <FontAwesomeIcon icon={darkModeEnabled ? faSun : faMoon} size="lg" opacity={0.8} />
      </Button>

      <Tooltip id="dark-mode" children={`Switch to ${darkModeEnabled ? 'light' : 'dark'} mode`} />
    </>
  )
}

export default DarkModeToggle
