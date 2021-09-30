# vue-color-input
Slick and perfomant vue 3 color picker component whose goal is to replace `<input type=color>`

## The Why

### 

### Stylish
Html's native color input is a pain to customize. Most likely you'll have to get tricky hiding the original input & binding click event to a presentable-looking div. But it only gets you halfway there cause the color picker popup window is still out of reach and it might look way different in different browsers.
With `vue-color-input` this poblem is solved. It looks pretty out of the box with the default styles, but it's also intuitive & straight-forward to customize from css. Keep reading for detailed instructions on how.

### Uniform
Not only that native color input looks different in different browsers, it also operates differently, and in some cases it's just not what you expect it to be. Yes, I'm looking at you, Safari. But even in modern browsers, sometimes the generic color picker is not effective enough. `vue-color-input` delivers a color picker that looks and performs the same regardless of browser.

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
```php
<color-input v-model="color" />
```