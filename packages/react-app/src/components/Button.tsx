import tw from 'tailwind-styled-components'

const Button = tw.button`
  px-4
  py-2
  rounded
  disabled:opacity-50
  ${(props) => (props.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
`

export default Button

export const Primary = tw(Button)`
  bg-blue-700
  ${(props) => (props.disabled ? '' : 'hover:bg-blue-600')}
`

export const Secondary = tw(Button)`
  bg-indigo-700
  ${(props) => (props.disabled ? '' : 'hover:bg-indigo-600')}
`

export const Dark = tw(Button)`
  bg-gray-800
  ${(props) => (props.disabled ? '' : 'hover:bg-gray-700')}
  text-gray-100
`

export const Light = tw(Button)`
  bg-gray-200
  ${(props) => (props.disabled ? '' : 'hover:bg-gray-700')}
  text-gray-900
`
