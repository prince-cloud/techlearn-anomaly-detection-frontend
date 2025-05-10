import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from 'util'

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
  Pie: () => null,
  Scatter: () => null,
  Bar: () => null,
}))

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as {
  new(label?: string, options?: TextDecoderOptions): globalThis.TextDecoder;
  prototype: globalThis.TextDecoder;
}
