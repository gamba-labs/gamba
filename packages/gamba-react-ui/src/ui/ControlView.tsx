import { useControlsStore } from '../useControlsStore'

export default function ControlView() {
  const controls = useControlsStore()

  return (
    <div className="gamba-ui-controls-wrapper">
      {controls.controlsNode && controls.controlsNode}
    </div>
  )
}
