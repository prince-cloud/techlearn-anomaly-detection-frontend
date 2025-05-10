import { camelCase, isObject, transform } from "lodash"

export const underscoreJsonToCamelCase = (obj: object) => transform(obj, (result: Record<string, unknown>, value, key) => {
  const camelKey = camelCase(key)

  result[camelKey] = isObject(value) ? underscoreJsonToCamelCase(value) : value
})
