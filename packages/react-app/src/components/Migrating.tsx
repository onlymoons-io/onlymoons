import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

export default function Migrating() {
  return (
    <div
      className={
        'h-10 fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-indigo-300 dark:bg-indigo-700 text-black dark:text-white'
      }
    >
      <div className={'flex items-center gap-4'}>
        <FontAwesomeIcon icon={faExclamationTriangle} />

        <span>
          We're migrating to v2 -{' '}
          <a className={'font-bold'} href={'https://v2.onlymoons.io/'}>
            https://v2.onlymoons.io/
          </a>
        </span>
      </div>
    </div>
  )
}
