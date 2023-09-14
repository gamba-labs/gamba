import React from 'react'
import { cx } from '../utils'
import Button from './Button'

export function useOnClickOutside(
  ref: React.RefObject<HTMLDivElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  React.useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }
        handler(event)
      }

      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    [ref, handler],
  )
}

interface SelectContext {
  value: any
  // setVisible: (visible: boolean) => void
  setValue: (t: any) => void
}

const SelectContext = React.createContext<SelectContext>(null!)

interface SelectRootProps<T> {
  value: T
  onChange: (value: T) => void
  children: React.ReactNode
  label: string
  format?: (value: T) => React.ReactNode
}

function Root<T>(props: SelectRootProps<T>) {
  // const id = React.useId()
  const ref = React.useRef<HTMLDivElement>(null!)
  const [value, _setValue] = React.useState(props.value)
  const [visible, setVisible] = React.useState(false)
  const setValue = (value: T) => {
    _setValue(value)
    setVisible(false)
    props.onChange(value)
  }
  useOnClickOutside(ref, () => setVisible(false))

  return (
    <SelectContext.Provider value={{ value, setValue }}>
      <div ref={ref} className="gamba-ui-select-container">
        <Button onClick={() => setVisible(!visible)}>
          {props.format ? props.format(props.value) : JSON.stringify(props.value)}
          {/* {props.label} {JSON.stringify(props.value)} */}
        </Button>
        {visible && (
          <div className="gamba-ui-select-popup">
            {props.children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  )
}

interface OptionProps<T> {
  value: T
  children: React.ReactNode
}

function Option<T>(props: OptionProps<T>) {
  const context = React.useContext(SelectContext)
  const selected = context.value === props.value
  return (
    <button
      onClick={() => context.setValue(props.value)}
      className={cx('gamba-ui-select-option', selected && 'selected')}
    >
      {props.children}
    </button>
  )
}

const Select = {
  Root,
  Option,
}

export default Select
