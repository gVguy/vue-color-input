export const allowedPosition = [
  "top", "top right", "top left", "top center",
  "right top", "right", "right bottom", "right center",
  "bottom right", "bottom", "bottom left", "bottom center",
  "left top", "left bottom", "left", "left center"
] as const

export type Position = typeof allowedPosition[number]


export const allowedFormat = [
  "rgb", "rgb object", "rgb string", 
  "hsv", "hsv object", "hsv string", 
  "hsl", "hsl object", "hsl string",
  "name", "name string",
  "hex", "hex string",
  "hex8", "hex8 string"
] as const

export type Format = typeof allowedFormat[number]

export type FormatCategory = 'rgb'|'hsv'|'hsl'|'name'|'hex'|'hex8'

export type FormatType = 'string'|'object'

