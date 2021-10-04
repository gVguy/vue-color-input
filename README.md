# vue-color-input
Slick and perfomant vue 3 color picker component whose goal is to replace `<input type=color>`

## Why

### Multi-format
Forget about color conversions: vue-color-input does it for you. Unlike input type=color (which only understands hex) vue-color-input supports all commonly used color models, and by default will output color in the same format that was passed as input. It also has support for alpha channel, unless you specifically disable it. More information below.

### Customizable
Html's native color input is annoying to style. Most likely you'll have to get tricky hiding the original input & binding click event to a presentable-looking div. But it only gets you halfway there cause the color picker popup window is still out of reach and it might look way different in different browsers.
With vue-color-input this poblem is solved. It looks pretty out of the box with the default styles, but it's also intuitive & straight-forward to customize from css. Keep reading for detailed instructions on how.

### Uniform
Not only that native color input looks different in different browsers, it also operates differently, and in some cases it's just not what you expect it to be. Yes, I'm looking at you, Safari. vue-color-input delivers a color picker that looks and performs the same regardless of browser.

### It just works
vue-color-input combines minimalist approach with comprehensive functionality. You *can* customize and extend it to your liking, set it up with additional properties, but you _don't have to_. It works as expected out of the box just as well with only `v-model` provided.

## Usage

### Install
```
npm i vue-color-input
```
### Import
```js
import ColorInput from 'vue-color-input'


app.use(ColorInput)

// OR register component globally

app.component('ColorInput', ColorInput)

// OR locally

export.default {
	components: { ColorInput }
}
```
### Use
```xml
<color-input v-model="color" />
```

## v-model

This is where you supply the variable holding the color to be adjusted by end user.
Model value is allowed to be changed externally too, vue-color-input will adjust accordingly.
When first initialized and every time v-model value updates _from outside the component_, incoming color format is stored to be matched by output.

### Input

Under the hood vue-color-input uses tinycolor for color conversion. So everything tinycolor [accepts as input](https://github.com/bgrins/TinyColor#accepted-string-input), is valid here as well (both string and object).

### Output

By default output will be a string or an object in the same color model as the initial value.

For example:
```js
// in parent component

export.default {
	data() {
		color: "rgb(50, 150, 150)"
	}
}
```
```xml
<!-- template -->

<color-input v-model="color">
```
User adjusts hue to `0`, now `color` becomes
```js
"rgb(150, 50, 50)"
```
Then user adjusts alpha to `0.5`, `color` becomes
```js
"rgba(150, 50, 50, 0.5)"
```

Let's say `color` property was initialy set to be an object:
```js
// in parent component

export.default {
	data() {
		color: { "h": 350, "s": 1, "l": 0.8 }
	}
}
```
In the same scenario the resulting output would be
```js
{ "h": 0, "s": 1, "l": 0.8, "a": 0.5 }
```

#### name|hex -> rgba fallback

However, if initial color format was `name` (e.g. `"purple"`) or `hex` (e.g. `"#800080"`), and then alpha is changed to be less than `1`, output will be formatted as `rgba`:
```js
"#cd5c5c" // hex input

/* user changes alpha to 0.9 */

"rgba(205, 92, 92, 0.9)" // rgba output
```

_Note: this behaviour does not apply if `format` property is explicitly set to be `hex` or `name`._
_Note 2: if initial color format is `hex8` (e.g. `#800080ff`), output will be `hex8` also, unless specified differently by `format` property._

#### name -> hex fallback

If initial color format was `name`, but the resulting output color does not have a name equivalent, `hex` value will be output instead:
```js
"indianred" // name input

/* user changes hue to 180 */

"#5ccdcc" // hex output
```

#### invalid -> rgb fallback

Invalid color initialy diasplays as black. Default output format will be set to `rgb`:
```js
"ironmanred" // invalid string input

/* user changes alpha to 0.1 */

"rgba(0, 0, 0, 0.1)" // rgb(a) output
```

