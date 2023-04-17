import { DefineComponent, PropType } from 'vue'

declare const ColorInput: DefineComponent<{
  modelValue: {
    type: PropType<string | Record<string, number>>
    required: true
  },
  position: {
    type: PropType<string>,
  },
  transition: {
    type: PropType<string>
  },
  disableAlpha: {
    type: PropType<boolean>
  },
  disabled: {
    type: PropType<boolean>
  },
  disableTextInputs: {
    type: PropType<boolean>
  },
  format: {
    type: PropType<string>
  }
}>

export default ColorInput
