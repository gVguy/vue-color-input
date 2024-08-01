const ROOT_CLASS = 'color-input'
export function bem(className, state = {}) {
	const baseClass = `${ROOT_CLASS}__${className}`
	const result = {}
	result[baseClass] = true
	for (const [key, value] of Object.entries(state)) {
		result[`${baseClass}--${key}`] = value
	}
	return result
}
