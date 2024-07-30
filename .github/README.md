# vue-color-input
Slick and perfomant Vue 3 color picker component whose goal is to replace `<input type="color">`

<p align="center">
    🚀&nbsp;&nbsp;<b><a href="https://gvguy.github.io/vue-color-input/">Live demo</a></b>&nbsp;&nbsp;🚀
</p>
<p align="center">
    <a href="https://codepen.io/vanechka222/pen/oNeNXrr">Codepen</a>
</p>

<p align="center">
    <img src="https://media.giphy.com/media/wyURgcSzyHlJcsOovd/source.gif">
</p>

## Why

### Multi-format
Forget about color conversions: vue-color-input does it for you. Unlike `<input type="color">` (which only understands hex) vue-color-input supports all commonly used color models, and by default __will output color in the same format that was passed as input__. It also has support for alpha channel, unless you specifically disable it.

### Customizable
HTML's native color input is annoying to style. Most likely you'll have to get tricky hiding the original input & binding click event to a presentable-looking div. But it only gets you halfway there cause the color picker popup window is still out of reach and it might look way different in different browsers.  
With vue-color-input this poblem is solved. It looks pretty out of the box with the default styles, but it's also intuitive & straight-forward to customize from css.

### Uniform
Not only that native color input looks different in different browsers, it also operates differently, and in some cases it's just not what you expect it to be. Yes, I'm looking at you, Safari. vue-color-input delivers a color picker that looks and performs the same regardless of browser.

### It just works
vue-color-input combines minimalist approach with comprehensive functionality. You *can* customize and extend it to your liking, set it up with additional properties, but you _don't have to_. It works as expected out of the box just as well, with only `v-model` provided.

## Installation 

### npm
```shell
npm i vue-color-input
```
```javascript
import ColorInput from 'vue-color-input'
```

### CDN
```xml
<script src="https://unpkg.com/vue-color-input@latest"></script>
```

## Usage
```javascript
// install it with use()
app.use(ColorInput)

// OR register component globally
app.component('ColorInput', ColorInput)

// OR locally
export.default {
    components: { ColorInput }
}
```
```xml
<color-input v-model="color" />
```


# Table of contents

| [Properties](#properties)                            | [Styling](#styling)                             | [Events](#events)           | [$refs & methods](#refs--methods)   |
|------------------------------------------------------|-------------------------------------------------|-----------------------------|-------------------------------------|
| [v-model](#v-model)                                  | [Transitions](#transitions)                     | [Event names](#event-names) | [Instances](#instances)             |
| [format](#format-optional)                           | [Box active transition](#box-active-transition) |                             | [Elements](#elements)               |
| [position](#position-optional)                       | [Example CSS](#example-css)                     |                             | [Methods](#methods)                 |
| [disabled](#disabled-optional)                       | [Styling guidelines](#styling-guidelines)       |                             | [`color` property](#color-property) |
| [disable-alpha](#disable-alpha-optional)             |                                                 |                             |                                     |
| [disable-text-inputs](#disable-text-inputs-optional) |                                                 |                             |                                     |
| [transition](#transition-optional)                   |                                                 |                             |                                     |


# Properties

## v-model

This is where you supply the variable holding the color to be adjusted by end user.  
Model value is allowed to be changed externally too, vue-color-input will adjust accordingly.  
When first initialized and every time v-model value updates _from outside the component_, incoming color format is stored to be matched by output.

### Input (initial value)

Under the hood vue-color-input uses [`tinycolor2`](https://www.npmjs.com/package/tinycolor2) for color conversion. So everything tinycolor [accepts as input](https://github.com/bgrins/TinyColor#accepted-string-input), is valid here as well (both string and object).

### Output (return value)

By default output will be a string or an object in the same color model as the initial value.

For example:
```javascript
// in parent component

export.default {
    data() {
        color: "rgb(50, 150, 150)"
    }
}
```
```xml
<!-- in template -->

<color-input v-model="color" />
```
User adjusts hue to `0`, now `color` becomes
```javascript
"rgb(150, 50, 50)"
```
Then user adjusts alpha to `0.5`, `color` becomes
```javascript
"rgba(150, 50, 50, 0.5)"
```

Let's say `color` property was initialy set to be an object:
```javascript
// in parent component

export.default {
    data() {
    color: { "h": 350, "s": 1, "l": 0.8 }
    }
}
```
In the same scenario the resulting output would be
```javascript
{ "h": 0, "s": 1, "l": 0.8, "a": 0.5 }
```

vue-color-input will always try to output color in the same color model as the initial value (unless target format is specified explicitly by `format` property.  
However in some cases that would not be possible. For those colors it will fall back to different formats.

### name || hex -> rgba fallback

If initial color format was `name` (e.g. `"purple"`) or `hex` (e.g. `"#800080"`), and then alpha is changed to be less than `1`, output will be formatted as `rgba`:
```javascript
"#cd5c5c" // hex input

/* user changes alpha to 0.9 */

"rgba(205, 92, 92, 0.9)" // rgba output
```

_Note: this behavior does not apply if `format` property is explicitly set to be `hex` or `name`._  
_Note 2: if initial color format is `hex8` (e.g. `#800080ff`), output will be `hex8` also, unless specified differently by `format` property._

### name -> hex fallback

If initial color format was `name`, but the resulting output color does not have a name equivalent, `hex` value will be output instead:
```javascript
"indianred" // name input

/* user changes hue to 180 */

"#5ccdcc" // hex output
```

### invalid -> rgb fallback

Invalid color initialy diasplays as black. Default output format will be set to `rgb`:
```javascript
"ironmanred" // invalid string input

/* user changes alpha to 0.1 */

"rgba(0, 0, 0, 0.1)" // rgb(a) output
```

## format <sub><sup>_`optional`_</sup></sub>

Here you can supply the color format you want the output to be in.

The value consists of two arguments: format & type. The order of two is inconsequential, e.g. both `"hsl object"` & `"object hsl"` are valid values.  

__Format__ is the target color model that the return value is converted to. `[ "rgb", "hsv", "hsl", "hex", "hex8", "name" ]`  

__Type__ is data type of the return value. `[ "string", "object" ]`  

If you want to use v-model value for styling, `"string"` type should do the job. On the other hand, if you want to continue processing the data, `"object"` is probably more useful.  

Hsv & hsl color component values are presented differently in different output types:
```javascript
"hsl(0, 53%, 58%)" // "hsl string"

{ "h": 0, "s": 0.531, "l": 0.582, "a": 1 } // "hsl object"
```
Notice how strings contain percent-based values, and object 0-1 floats.

>Note that name & hex formats don't support alpha channel. Specifying either of them as target format will prevent vue-color-input from falling back to rgba. Instead, it will disable alpha slider and always return full opacity color.  
>If this is not the behavior that you want, and you'd rather it fall back to rgba to support alpha, you should not specify the format.

### Type
String

### Allowed values
```javascript
[ "rgb", "rgb object", "rgb string", 
  "hsv", "hsv object", "hsv string", 
  "hsl", "hsl object", "hsl string",
  "name", "name string",
  "hex", "hex string",
  "hex8", "hex8 string" ]
```
_Note: `"name object"`, `"hex object"` & `"hex8 object"`, make no sense and therefore are illegal._  
_Note 2: format without type is allowed, type without format is not._

### Default value
Calculated to match the input.

### Example
```xml
<color-input v-model="color" format="rgb object" />
```

## position <sub><sup>_`optional`_</sup></sub>

This is where you specify the position of the popup color picker window relative to the clickable box.

### Type
String

### Allowed values
```javascript
[ "top", "top right", "top left", "top center",
  "right top", "right", "right bottom", "right center",
  "bottom right", "bottom", "bottom left", "bottom center",
  "left top", "left bottom", "left", "left center" ]
```
Pretty intuitive: the first value is the direction from the box in which the popup will appear, the second is how it will align.  
_Note: Omitting the second parameter results in center alignment, making `"top"` a shortcut for `"top center"`_

### Default value
`"bottom"`

### Example
```xml
<color-input v-model="color" position="right top" />
```

## disabled <sub><sup>_`optional`_</sup></sub>

Setting this to `true` will make the initial box nonresponsive to user clicks. The popup will not appear.  
However the box will still react to v-model changes, should they come from elsewhere.

### Type
Boolean

### Allowed values
```javascript
[ true, false ]
```

### Default value
`false`

### Example
```xml
<color-input v-model="color" :disabled="!allowColorAdjustment" />
```

## disable-alpha <sub><sup>_`optional`_</sup></sub>

If you set this to `true`, alpha slider will be removed from the color picker, and the returned color will always have full opacity.

>Specifying name or hex as the target `format` will make this property default to `true` and ignore any passed value.

### Type
Boolean

### Allowed values
```javascript
[ true, false ]
```

### Default value
`false`,  
`true` if target format is hex or name

### Example
```xml
<color-input v-model="color" disable-alpha />
```

## disable-text-inputs <sub><sup>_`optional`_</sup></sub>

With this property you can hide the section of the color picker containing the text inputs.

### Type
Boolean

### Allowed values
```javascript
[ true, false ]
```

### Default value
`false`

### Example
```xml
<color-input v-model="color" disable-text-inputs />
```

## transition <sub><sup>_`optional`_</sup></sub>

Set this to a custom transition name to override factory enter and leave-to transitions of the popup.

This is _not_ the only way to customize color picker transition.  
You can also override default transition classes from css. More details [below](#transitions).

>More information about Vue enter/leave transitions [here](https://v3.vuejs.org/guide/transitions-enterleave.html).

### Type
String

### Default value
`"picker"`

### Example
```xml
<color-input v-model="color" transition="my-cool-transition" />
```
```css
.my-cool-transition-enter-from,
.my-cool-transition-leave-to {
    transform: rotate(240) scale(.5);
    opacity: 0;
}
.my-cool-transition-enter-active,
.my-cool-transition-leave-active {
    transition: transform .3s, opacity .3s;
}
```


# Styling

As previously mentioned, applying styles to vue-color-input is a breeze.

Default CSS is written with custumizability in mind, so anything you want to style will likely work as expected, and the whole component's layout will not get screwed up by that.

To override factory styles, you should address elemets through `.color-input.user` parent selector, e.g:
```css
.color-input.user .box { }
```

### Class names

| class                   | description                                             |
|-------------------------|---------------------------------------------------------|
| __.color-input__        | Root element                                            |
| __.box__                | Initial clickable box                                   |
| __.picker-popup__       | Popup color picker window                               |
| __.saturation-area__    | Picking area where you select saturation and brightness |
| __.slider__             | Hue and opacity sliders (track)                         |
| __.saturation-pointer__ | Pointer in the saturation-brightness area               |
| __.slider-pointer__     | Pointer on a slider                                     |
| __.text-input__         | Text inputs of the color picker                         |

Feel free to scout the HTML for more class names.

## Transitions

Instead of using `transition` property with a custom transition name, you can simply override default transition styles.  
This can be done in the same manner as with the other classes, e.g:

```css
.picker-popup-enter-from {
    transform: translateY(-100%) scale(.1);
}
.picker-popup-leave-to {
    transform: scale(3);
}
/* and if you want to change the durations as well */
.picker-popup-enter-active,
.picker-popup-leave-active {
    transition: all .5s;
}
```

>More information about Vue enter/leave transitions [here](https://v3.vuejs.org/guide/transitions-enterleave.html).

## Box active transition

When clicked on, the box gets what looks like an outline, but in reality its content is scaled down and background is revealed.

Here's what the box element html looks like:
```xml
<div class="box [active] [disabled]"> <!-- This has a background -->
    <div class="inner transparent"> <!-- This scales down to reveal it -->
        <div class="color"></div>
    </div>
</div>
```
To customize this transition, you can use `.box.active` in combination with `.box.active .inner`.  
For example:
```css
.color-input.user .box.active {
    /* "outline" color */
    background: #0f0f0f;
}
.color-input.user .box.active .inner {
    /* different transition effect */
    transform: scale(.9) rotate(90deg);
}
```

## Example CSS

```css
.color-input.user .box {
    /* make clickable box a 100x100 circle */
    width: 100px;
    height: 100px;
    border-radius: 50px;
}
.picker-popup.user {
    /* dark mode for popup window */
    background: #000;
    color: #fbfbfb;
    /* and make it wide */
    width: 400px;
}
.picker-popup .slider {
    /* thin out the sliders and make them wider */
    height: 2px;
    width: 92%;
}
.picker-popup .saturation-area {
    /* bigger picking area */
    height: 150px;
}
.picker-popup .slider-pointer {
    /* make slider pointers square-ish and 10x10 */
    border-radius: 4px;
    width: 10px;
    height: 10px;
}
.picker-popup .saturation-pointer {
    /* increase saturation pointer size */
    width: 40px;
    height: 40px;
}
```

## Styling guidelines

### Root element is _not_ the `.box`

Here's the base structure of the component:
```xml
<!-- When there is no appendTo set up -->
<div class="color-input">
    <div class="box [active] [disabled]"></div>
    <div class="picker-popup"></div> <!-- position: absolute -->
</div>

<!-- When there is appendTo set up -->
<div class="color-input">
    <div class="box [active] [disabled]"></div>
</div>
<div id="appendToId">
    <div class="picker-popup"></div> <!-- position: absolute -->
</div>
```
Root element wraps arond the clickable box, but if you want to change box styles, you should select it like this: `.color-input.user .box`.

Generally, you should attempt to style the root element only if you want to customize the flow: properties like `margin`, `position`, `display`.

_Changing size of the root element independently from the box will mess with how the popup is positioned._

### Use stylesheets, no need to pass inline styles

Inline styles will only let you style the root element, which is typically not what you want to style very often.

### Use `.user` to override default styles

There is no need to use `!important`. Default styles are easily overridable by adding specificity to the selectors with `.color-input.user .box` or `.picker-popup.user`.

And if you use scss that's even more natural with nesting:
```scss
.color-input.user {
    .box {}
}
.picker-popup.user {}
```

### Set margin on the root element

`margin` is one of the few properties that should belong to the `.color-input` itself.  
Setting margin on the `.box` instead will increase the space around it _inside_ the root element, and that _will mess with how the popup is positioned._


# Events

The instance provides hooks for custom event handling.

Most events carry payload with current state of the corresponding color component.

Notice that event data is always passed in __hsv__ format.

## Event names

| event                    | description                                                                                                                                                                                   | payload                                                                         |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| __pickEnd__              | color picking process is finished, popup will close now                                                                                                                                       |                                                                                 |
| __mounted__              | lifecycle hook, emitted from root component's mounted()                                                                                                                                       |                                                                                 |
| __beforeUnmount__        | lifecycle hook, emitted from root component's beforeUnmount()                                                                                                                                 |                                                                                 |
| __pickStart__            | color picking process is initiated, popup is opening                                                                                                                                          |                                                                                 |
| __saturationInputStart__ | saturation-brightness adjustment has begun.<br />This is only emitted when pointerdown inside saturation-brightness area is registered.<br />This will _not_ emit when text inputs are edited | current state of saturation & value (hsv)<br />`{ s: 0.5, v: 0.5 }`             |
| __saturationInputEnd__   | saturation-brightness adjustment has ended.<br />This is only emitted when pointerup of the saturation-brightness area is registered.<br />This will _not_ emit when text inputs are edited   | current state of saturation & value (hsv)<br />`{ s: 0.5, v: 0.5 }`             |
| __saturationInput__      | saturation-brightness is being adjusted.<br />This will emit every time saturation-brightness is changed, including text inputs                                                               | current state of saturation & value (hsv)<br />`{ s: 0.5, v: 0.5 }`             |
| __hueInputStart__        | hue adjustment has begun.<br />This is only emitted when pointerdown over the hue slider is registered.<br />This will _not_ emit when hue is changed from text inputs                        | current state of hue<br />`{ h: 180 }`                                          |
| __hueInputEnd__          | hue adjustment has ended.<br />This is only emitted when pointerup of the hue slider is registered.<br />This will _not_ emit when hue is changed from text inputs                            | current state of hue<br />`{ h: 180 }`                                          |
| __hueInput__             | hue is being adjusted.<br />This will emit every time hue is changed, including text inputs                                                                                                   | current state of hue<br />`{ h: 180 }`                                          |
| __alphaInputStart__      | alpha adjustment has begun.<br />This is only emitted when pointerdown over the alpha slider is registered.<br />This will _not_ emit when alpha is changed from text inputs                  | current state of alpha<br />`{ a: 0.5 }`                                        |
| __alphaInputEnd__        | alpha adjustment has ended.<br />This is only emitted when pointerup of the alpha slider is registered.<br />This will _not_ emit when alpha is changed from text inputs                      | current state of alpha<br />`{ a: 0.5 }`                                        |
| __alphaInput__           | alpha is being adjusted.<br />This will emit every time alpha is changed, including text inputs                                                                                               | current state of alpha<br />`{ a: 0.5 }`                                        |
| __change__               | the color has changed by user interaction.<br />This will emit every time _any_ parameter is changed. <br />This _will_ emit when color is changed from text inputs as well, on blur          | current state of all color components<br />`{ h: 180, s: 0.5, v: 0.5, a: 0.5 }` |

## Example

```xml
<color-input v-model="color" @mounted="colorInputMountedHandler" @pickStart="colorPickerShowHandler" />
```


# $refs & methods

You shouldn't _need_ to manually access instance elements or methods, but if you feel like it, you can.  
This can be done by specifying a `ref` property on the instance.

The following section implies you have a vue-color-input instance with a `ref` property set to `"colorInput"`:
```xml
<color-input v-model="color" ref="colorInput" />
```

## Instances

```javascript
const colorInput = this.$refs.colorInput // root instance
const picker = colorInput.$refs.picker // popup color picker instance
```

## Elements

```javascript
colorInput.$refs.root // root element
colorInput.$refs.box // box root element
picker.$refs.rootPicker // color picker root element
```

## Methods

```javascript
colorInput.pickStart() // begin color selection (show popup)
colorInput.pickEnd() // end color selection (hide popup)
```

## `color` property

```javascript
colorInput.color // tinycolor instance
```


# License

MIT



