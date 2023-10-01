import React from 'react'

export function DocumentTitle({title}: {title: string}) {
  const defaultTitle = React.useRef(document.title)

  React.useEffect(() => {
    document.title = title + ' | Gamba'
    return () => {
      document.title = defaultTitle.current
    }
  }, [title])
  return null
}
