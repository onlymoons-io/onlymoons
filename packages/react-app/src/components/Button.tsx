import tw from 'tailwind-styled-components'

const Button = tw.button`
  px-4
  py-2
  rounded
  disabled:opacity-50
  ${props => (props.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
`

export default Button

export const Primary = tw(Button)`
  bg-blue-500
  dark:bg-blue-700
  text-gray-100
  ${props => (props.disabled ? '' : 'hover:bg-blue-400 dark:hover:bg-blue-600')}
`

export const Secondary = tw(Button)`
  bg-indigo-700
  text-gray-100
  ${props => (props.disabled ? '' : 'hover:bg-indigo-600')}
`

export const Dark = tw(Button)`
  bg-gray-800
  dark:bg-gray-200
  ${props => (props.disabled ? '' : 'hover:bg-gray-700 dark:hover:bg-gray-300')}
  text-gray-100
  dark:text-gray-900
`

export const Light = tw(Button)`
  bg-gray-100
  dark:bg-gray-700
  dark:bg-opacity-50
  ${props => (props.disabled ? '' : 'hover:bg-white dark:hover:bg-gray-700')}
  text-gray-900
  dark:text-gray-100
`

export const Success = tw(Button)`
  bg-green-700
  text-gray-100
  ${props => (props.disabled ? '' : 'hover:bg-green-600')}
`

export const Ghost = tw(Button)`
  text-gray-800
  dark:text-gray-200
  ${props => (props.disabled ? '' : 'hover:bg-white dark:hover:bg-gray-700')}
`
