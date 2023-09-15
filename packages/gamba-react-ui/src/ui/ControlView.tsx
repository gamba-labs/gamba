import { HTMLAttributes } from 'react'
import { useControlsStore } from '../useControlsStore'
import { cx } from '../utils'

interface Props extends HTMLAttributes<HTMLDivElement> {

}

export default function ControlView(props: Props) {
  const {
    className,
    ...rest
  } = props
  const controls = useControlsStore()

  return (
    <div {...rest} className={cx('gamba-ui-controls-wrapper', className)}>
      {controls.controlsNode && controls.controlsNode}
    </div>
  )
}
