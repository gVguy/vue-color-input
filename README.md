<!-- short readme for npm. full readme .github/README.md -->

# vue-color-input
Slick and perfomant Vue 3 color picker component whose goal is to replace `<input type=color>`

<p align="center">
    🚀&nbsp;&nbsp;<b><a href="https://gvguy.github.io/vue-color-input/">Live demo</a></b>&nbsp;&nbsp;🚀
</p>

## Why

### Multi-format
Forget about color conversions: vue-color-input does it for you. Unlike `<input type=color>` (which only understands hex) vue-color-input supports all commonly used color models, and by default __will output color in the same format that was passed as input__. It also has support for alpha channel, unless you specifically disable it.

### Customizable
HTML's native color input is annoying to style. Most likely you'll have to get tricky hiding the original input & binding click event to a presentable-looking div. But it only gets you halfway there cause the color picker popup window is still out of reach and it might look way different in different browsers.  
With vue-color-input this poblem is solved. It looks pretty out of the box with the default styles, but it's also intuitive & straight-forward to customize from css.

### Uniform
Not only that native color input looks different in different browsers, it also operates differently, and in some cases it's just not what you expect it to be. Yes, I'm looking at you, Safari. vue-color-input delivers a color picker that looks and performs the same regardless of browser.

### It just works
vue-color-input combines minimalist approach with comprehensive functionality. You *can* customize and extend it to your liking, set it up with additional properties, but you _don't have to_. It works as expected out of the box just as well, with only `v-model` provided.

## Usage

### Install
```
npm i vue-color-input
```

### Import
```javascript
import ColorInput from 'vue-color-input'


// install it with use()

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


# Docs

See complete documentation [on github](https://github.com/gVguy/vue-color-input#table-of-contents)


# License

MIT



