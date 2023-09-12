import React from 'react'
import { cx } from '../utils'
import Button from './Button'

interface SelectContext {
  value: any
  // setVisible: (visible: boolean) => void
  setValue: (t: any) => void
}

const SelectContext = React.createContext<SelectContext>(null!)

interface SelectProps<T> {
  value: T
  onChange: (value: T) => void
  children: React.ReactNode
  label: string
}

export function Select<T>(props: SelectProps<T>) {
  // const id = React.useId()
  const [value, _setValue] = React.useState(props.value)
  const [visible, setVisible] = React.useState(false)
  const setValue = (value: T) => {
    _setValue(value)
    setVisible(false)
    props.onChange(value)
  }
  return (
    <SelectContext.Provider value={{ value, setValue }}>
      <div className="gamba-ui-select-container">
        <Button onClick={() => setVisible(!visible)}>
          {props.label} {JSON.stringify(props.value)}
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

export function Option<T>(props: OptionProps<T>) {
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
