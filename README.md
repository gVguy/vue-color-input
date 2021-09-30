# vue-color-input
Slick and perfomant vue 3 color picker component whose goal is to replace `<input type=color>`

## The Why



### Styling
Html's native color input is a pain to customize. Most likely you'll have to get tricky hiding the original input & binding click event to a presentable-looking div. But it only gets you halfway there cause the color picker popup window is still out of reach and it might look way different in different browsers.
With `vue-color-input` this poblem is solved. It looks pretty out of the box with the default styles, but it's also intuitive & straight-forward to customize from css. Keep reading for detailed instructions on how.

## Uniform

## Usage

### Install
```
npm i vue-color-input
```
### Import
```javascript
import ColorInput from 'vue-color-input';

app.component('ColorInput', ColorInput);
```
###