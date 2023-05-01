function hue(str: string) {
  const hash = str.split('').reduce((acc, char) =>
    ((acc << 5) - acc) + char.charCodeAt(0) | 0, 0)
  return Math.floor(Math.abs(Math.sin(hash)) * 360)
}

export const HexColor = (props: {children: string}) => {
  const numChunks = Math.floor(props.children.length / 12)
  return (
    <>
      {Array.from({ length: numChunks }).map((_, i) => {
        const chunk = props.children.substring(i * 12, i * 12 + 12)
        return (
          <span key={i} style={{ color: `hsl(${hue(chunk)}, 90%, 70%)` }}>
            {chunk}
          </span>
        )
      })}
    </>
  )
}
