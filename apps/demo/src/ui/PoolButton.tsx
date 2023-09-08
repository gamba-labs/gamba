import React from 'react'
import { Button2 } from '../components/Button/Button'
import { Modal2 } from '../components/Modal/Modal'

interface Pool {
  ticker: string
  image: string
  decimals: number
}

const fakePools: Pool[] = [
  {
    ticker: 'SOL',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAABHVBMVEUAAABpeuIw0r+SSvuLT/Z+Xe5vcuWFPd9ihN5ZkdhUl9ZSmtRKqM9DtMuOTfiIUfSBW/B4Z+pycOdghtxcjdpPn9JFscs4xsM2ycIn4rcl5rMj6bAf8acZDSsGKR8LEhuXRv6FVfJ5ZOtmf+B5Stt6Rdd1SdVOotFIq85Hrc09vcc/u8c9vsZPfb4u1b0q3bpXYrlEjrci7KwlyKckwaMhyJ0dzpgZ1o4W24gKGB0EHxaLSfGORO+PQe92ael3aOlgiNyBQNt/Qdp9Q9lxUNJNpNBNo9BqWc1wSMtjYck8wMU1y8Er27tqL7A2pq0vsKk3mKkh5KcpuaYc9qE2kKEluJ4d550Y6ZMc0pMRrWshETkHNiYPFSMVCiMRCh56+sY0AAAAw0lEQVQoz2MY9sAyxM8/yMTU1MwswtzcwiISVVbeUINXR4JJX1JK2khGJjjcClVWl0uUR0xLHCofJoeq2YBDBCSvLc7kA5QPjKaquz1Y7dmUhTm53TR5vbz1jOXQpOPUWAXZGIHy6iAPYMrLqggoCTECHajOw6slwWRihVUe7oFQqro9ypqPhV+R1Y5N2YGT21UzAM1qG2ZmkDzUA4aWKLKxtgoKIHkWfgFBoAN15VE1+7IDgaOTs6qqmou7p0EMw3AHAFJlGm9W19BkAAAAAElFTkSuQmCC',
    decimals: 9,
  },
]

export function PoolButton() {
  const [poolModal, setPoolModal] = React.useState(false)
  const [selectedPool] = React.useState(fakePools[0])

  return (
    <>
      {poolModal && (
        <Modal2 onClose={() => setPoolModal(false)}>
          <h1>
            Select Token
          </h1>
          <p style={{ textAlign: 'center', padding: '0 30px' }}>
            Custom tokens and liquidity pools coming soon!
            <br />
            <br />
            <Button2 variant="ghost" onClick={() => setPoolModal(false)}>
              Close
            </Button2>
          </p>
        </Modal2>
      )}
      <Button2
        onClick={() => setPoolModal(true)}
        className="dark"
        icon={<img height="20" src={selectedPool.image} />}
      >
        {selectedPool.ticker}
      </Button2>
    </>
  )
}
