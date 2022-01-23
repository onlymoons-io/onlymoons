import React, { createContext, useState, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

export interface ILockWatchlist {
  //
  watchlist?: string[]
  isWatching?: (id: number) => boolean
  addToWatchlist?: (id: number) => void
  removeFromWatchlist?: (id: number) => void
}

export const LockWatchlist = createContext<ILockWatchlist>({})

const LockWatchlistProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React()
  const [watchlist, setWatchlist] = useState<string[]>()

  const getCurrentWatchlist = useCallback(() => {
    return !chainId
      ? []
      : (window.localStorage.getItem(`OM_LOCK_WATCH_${chainId}`) || '')
          .split(',')
          .map(v => v.trim())
          .filter(v => v !== '')
  }, [chainId])

  useEffect(() => setWatchlist(getCurrentWatchlist()), [getCurrentWatchlist])

  useEffect(() => {
    if (!chainId || !watchlist) return

    window.localStorage.setItem(`OM_LOCK_WATCH_${chainId}`, watchlist.join(','))
  }, [chainId, watchlist])

  const isWatching = useCallback(
    (id: number) => {
      return watchlist?.some(v => v === id.toString()) || false
    },
    [watchlist],
  )

  return (
    <LockWatchlist.Provider
      value={{
        //
        watchlist,

        isWatching,

        addToWatchlist: (id: number) => {
          const set = new Set(getCurrentWatchlist())
          set.add(id.toString())
          setWatchlist(Array.from(set))
        },

        removeFromWatchlist: (id: number) => {
          const set = new Set(getCurrentWatchlist())
          set.delete(id.toString())
          setWatchlist(Array.from(set))
        },
      }}
    >
      {children}
    </LockWatchlist.Provider>
  )
}

export default LockWatchlistProvider
