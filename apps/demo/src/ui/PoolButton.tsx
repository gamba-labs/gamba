import { Svg } from 'gamba/react-ui'
import React from 'react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'

export function PoolButton() {
  const [poolModal, setPoolModal] = React.useState(false)

  return (
    <>
      {poolModal && (
        <Modal onClose={() => setPoolModal(false)}>
          <h1>
            Select a Pool
          </h1>
          <Button className="list transparent">
            <div>
              SOL <small style={{ opacity: .5 }}>$123,000</small>
            </div>
            <img height="25" src="https://jup.ag/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&w=48&q=75" />
          </Button>
          <Button className="list transparent">
            <div>
              GUAC <small style={{ opacity: .5 }}>$123,000</small>
            </div>
            <img height="25" src="https://shdw-drive.genesysgo.net/36JhGq9Aa1hBK6aDYM4NyFjR5Waiu9oHrb44j1j8edUt/image.png" />
          </Button>
          <Button className="list transparent">
            <div>
              More
            </div>
            <Svg.ArrowRight />
          </Button>
        </Modal>
      )}
      <Button onClick={() => setPoolModal(true)} className="dark">
          SOL <img height="20" src="https://jup.ag/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&w=48&q=75" />
      </Button>
    </>
  )
}
