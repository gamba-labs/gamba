import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(getMatches(query))

  function handleChange() {
    setMatches(getMatches(query))
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query)

    handleChange()

    matchMedia.addEventListener('change', handleChange)

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange)
      } else {
        matchMedia.removeEventListener('change', handleChange)
      }
    }
  }, [query])

  return matches
}

export default useMediaQuery
