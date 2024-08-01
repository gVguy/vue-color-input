<template>
	<div
		ref="pickerRoot"
		:style="[
			pickerPosition,
			{
				'--box-width': boxRect.width + 'px',
				'--box-height': boxRect.height + 'px'
			}
		]"
		:class="bem('popup', {
			[position[0]]: true,
			[position[1]]: true,
			[position.join('-')]: true
		})"
	>
		<div :class="bem('saturation-area')" :style="pureHueBackground" @pointerdown="saturationPickStart">
			<canvas :class="bem('slider-canvas')" ref="saturationCanvas"></canvas>
			<div :class="bem('saturation-pointer')" ref="saturationPointer" :style="[saturationPointerStyles, {background: hexString}]"></div>
		</div>
		<div :class="bem('slider')" @pointerdown="huePickStart">
			<div :class="bem('slider-container')">
				<canvas :class="bem('slider-canvas')" ref="hueCanvas"></canvas>
			</div>
			<div :class="bem('slider-active-area')">
				<div :class="bem('slider-pointer')" ref="huePointer" :style="[ huePointerStyles, pureHueBackground ]"></div>
			</div>
		</div>
		<div v-if="!disableAlpha" :class="bem('slider')" @pointerdown="alphaPickStart">
			<div
				:class="bem('slider-container')"
				:style="transparentPatternBg"
			>
				<div :class="bem('slider-canvas')" ref="alphaCanvas" :style="alphaCanvasStyles"></div>
			</div>
			<div :class="bem('slider-active-area')">
				<div :class="bem('slider-pointer')" ref="alphaPointer" :style="alphaPointerStyles">
					<div
						:class="bem('pointer-transparent')"
						:style="[alphaPointerTransparentStyles, transparentPatternBg]"
					>
						<div
							:class="bem('pointer-color')"
							:style="[alphaPointerColorStyles, {background: hexString}]" />
					</div>
				</div>
			</div>
		</div>
		<div :class="bem('text-inputs-area')" v-if="!disableTextInputs" :style="{'--outline-color': hexString}">
			<div :class="bem('text-inputs-wrapper')">
				<div
					v-for="value, key in (textInputActive) ? textInputsFreeze : textInputs" 
					:key="'text-input-' + key"
					:class="bem('text-input-container')"
				>
					<label :for="'text-input-' + key">{{key}}</label>
					<input
						:value="value"
						:class="bem('text-input', { [key]: true })"
						autocomplete="off"
						spellcheck="false" 
						:id="'text-input-' + key"
						:data-component="key"
						@input.prevent="textInputInputHandler"
						@focus="textInputFocusHandler"
						@blur="textInputBlurHandler"
						@keypress.enter="$event.target.blur()"
					>
				</div>
			</div>
			<div :class="bem('text-format-arrows')" :style="arrowsStyles">
				<div :class="bem('arrow-up')" @click="textInputFormatChange(-1)"></div>
				<div :class="bem('arrow-down')" @click="textInputFormatChange(1)"></div>
			</div>
		</div>
	</div>
</template>

<script>
import transparentPattern from '../assets/transparent-pattern.svg'
import {bem} from '../bem'
import tinycolor from 'tinycolor2'

export default {
	name: 'ColorPicker',
	props: [
		'color',
		'position',
		'boxRect',
		'disableAlpha',
		'disableTextInputs'
	],
	emits: [
		'updateColor',
		'hueInputStart',
		'hueInputEnd',
		'hueInput',
		'alphaInputStart',
		'alphaInputEnd',
		'alphaInput',
		'saturationInputStart',
		'saturationInputEnd',
		'saturationInput',
		'ready',
		'change'
	],
	data() {
		return {
			h: undefined,
			s: undefined,
			v: undefined,
			a: undefined,
			hueTranslateX: 0,
			alphaTranslateX: 0,
			saturationTranslateX: 0,
			saturationTranslateY: 0,
			sliderPointerWidth: 0,
			saturationPointerWidth: 0,
			saturationPointerHeight: 0,
			pickerPositionA: {
				anchor: 'top',
				offset: 0
			},
			pickerPositionB: {
				anchor: 'left',
				offset: 0
			},
			pickerWidth: 0,
			pickerHeight: 0,
			textInputsFormat: 'rgb',
			textInputActive: null,
			textInputsFreeze: {},
			arrowColor: '#0f0f0f',
			sliderWidth: 0,
		}
	},
	computed: {
		pureHueBackground() {
			return {
				background: 'hsl(' + this.h + ', 100%, 50%)'
			}
		},
		hexString() {
			return this.color.toHexString()
		},
		huePointerStyles() {
			return {
				transform: 'translate(' + (this.hueTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		alphaPointerStyles() {
			return {
				transform: 'translate(' + (this.alphaTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		alphaPointerTransparentStyles() {
			return {
				backgroundPosition: -this.alphaTranslateX + 'px',
			}
		},
		alphaPointerColorStyles() {
			return {
				opacity: this.a,
			}
		},
		alphaCanvasStyles() {
			return {
				background: 'linear-gradient(90deg, transparent 0%, ' + this.color.toHexString() + ' 100%)'
			}
		},
		saturationPointerStyles() {
			const translateX = this.saturationTranslateX - this.saturationPointerWidth * .5;
			const translateY = this.saturationTranslateY + this.saturationPointerHeight * .5;
			return {
				transform: 'translate(' + translateX + 'px, ' + translateY + 'px)'
			}
		},
		arrowsStyles() {
			return {
				'--arrow-color': this.arrowColor
			}
		},
		pickerPosition() {
			let { top, left } = this.boxRect
			top += window.scrollY
			left += window.scrollX
			const [yAlign, xAlign] = this.position
			if (yAlign == 'bottom') {
				top += this.boxRect.height
			} else if (yAlign == 'top') {
				top -= this.pickerHeight
			} else { // y center
				top += this.boxRect.height * .5
				top -= this.pickerHeight * .5
			}
			if (xAlign == 'right') {
				if (yAlign == 'center') {
					left += this.boxRect.width
				}
			} else if (xAlign == 'left') {
				left -= this.pickerWidth
				if (yAlign != 'center')
					left += this.boxRect.width
			} else { // x center
				left += this.boxRect.width * .5
				left -= this.pickerWidth * .5
			}
			return {
				top: top + 'px',
				left: left + 'px'
			};
		},
		textInputs() {
			const format = this.textInputsFormat;
			const textInputs = {};
			if (['name','hex'].includes(format)) {
				textInputs.hex = this.color.toString('hex');
			} else {
				const stringSplit = this.color.toString(format).split('(')[1].slice(0,-1).split(', ');
				format.split('').forEach((k, i) => textInputs[k] = stringSplit[i]);
			}
			if (!this.disableAlpha) {
				textInputs.a = Number(this.color.getAlpha().toFixed(2));
			}

			// if textInputs has hue, add it from this.h
			if (textInputs.hasOwnProperty('h')) {
				// in mode with hue, use this.h
				textInputs.h = Math.round(this.h);
				if (textInputs.hasOwnProperty('l')) {
					// we're in hsl, use this.s

					//convert s(hsv) to s(hsl)
					let s = this.s;
					const v = this.v || 0.001;
					const l = (2 - s) * v / 2;
					if (l < 0.5) {
						s *= v / (l * 2);
						// convert to % and use
						textInputs.s = Math.round(s * 100) + '%';
					}
				}
			}
			return textInputs;
		},
		transparentPatternBg() {
			return { backgroundImage: `url(${transparentPattern})` }
		}
	},
	methods: {
		bem,
		saturationPickStart(e) {
			this.getCanvasRects();
			document.addEventListener('pointerup', this.saturationPickEnd);
			document.addEventListener('pointermove', this.saturationPickMove);
			this.saturationPickMove(e);
			this.emitHook('saturationInputStart', { s: this.s, v: this.v });
			this.colorSnapshot = this.color.toRgbString(); // this to track change
		},
		saturationPickEnd(e) {
			document.removeEventListener('pointerup', this.saturationPickEnd);
			document.removeEventListener('pointermove', this.saturationPickMove);
			this.emitHook('saturationInputEnd', { s: this.s, v: this.v });
			if (this.colorSnapshot !== this.color.toRgbString()) {
				// something changed, emit change hook
				this.emitHook('change', { h: this.h, s: this.s, v: this.v, a: this.a });
			}
		},
		saturationPickMove(e) {
			if (e.clientX >= this.saturationCanvasRect.x && e.clientX <= this.saturationCanvasRect.right) {
				this.s = ((e.clientX - this.saturationCanvasRect.x) / this.saturationCanvasRect.width);
			} else if (e.clientX < this.saturationCanvasRect.x) this.s = 0;
			else this.s = 1;
			if (e.clientY >= this.saturationCanvasRect.y && e.clientY <= this.saturationCanvasRect.bottom) {
				this.v = (1 - ((e.clientY - this.saturationCanvasRect.y) / this.saturationCanvasRect.height));
			} else if (e.clientY < this.saturationCanvasRect.y) this.v = 1;
			else this.v = 0;
		},
		huePickStart(e) {
			this.getCanvasRects();
			document.addEventListener('pointerup', this.huePickEnd);
			document.addEventListener('pointermove', this.huePickMove);
			this.huePickMove(e);
			this.emitHook('hueInputStart', { h: this.h });
			this.colorSnapshot = this.color.toRgbString(); // this to track change
		},
		huePickEnd(e) {
			document.removeEventListener('pointerup', this.huePickEnd);
			document.removeEventListener('pointermove', this.huePickMove);
			this.emitHook('hueInputEnd', { h: this.h });
			if (this.colorSnapshot !== this.color.toRgbString()) {
				// something changed, emit change hook
				this.emitHook('change', { h: this.h, s: this.s, v: this.v, a: this.a });
			}
		},
		huePickMove(e) {
			if (e.clientX >= this.hueCanvasRect.x && e.clientX <= this.hueCanvasRect.right) {
				this.h = ((e.clientX - this.hueCanvasRect.x) * 360 / this.hueCanvasRect.width);
			} else if (e.clientX < this.hueCanvasRect.x) this.h = 0;
			else this.h = 360;
		},
		alphaPickStart(e) {
			this.getCanvasRects();
			document.addEventListener('pointerup', this.alphaPickEnd);
			document.addEventListener('pointermove', this.alphaPickMove);
			this.alphaPickMove(e);
			this.emitHook('alphaInputStart', { a: this.a });
			this.colorSnapshot = this.color.toRgbString(); // this to track change
		},
		alphaPickEnd(e) {
			document.removeEventListener('pointerup', this.alphaPickEnd);
			document.removeEventListener('pointermove', this.alphaPickMove);
			this.emitHook('alphaInputEnd', { a: this.a });
			if (this.colorSnapshot !== this.color.toRgbString()) {
				// something changed, emit change hook
				this.emitHook('change', { h: this.h, s: this.s, v: this.v, a: this.a });
			}
		},
		alphaPickMove(e) {
			if (e.clientX >= this.alphaCanvasRect.x && e.clientX <= this.alphaCanvasRect.right) {
				this.a = ((e.clientX - this.alphaCanvasRect.x) / this.alphaCanvasRect.width);
			} else if (e.clientX < this.alphaCanvasRect.x) this.a = 0;
			else this.a = 1;
		},
		emitUpdate(output) {
			output = output || { h: this.h, s: this.s, v: this.v, a: this.a };
			this.$emit('updateColor', output);
		},
		emitHook(eventName, value) {
			if (typeof value === 'object') {
				for (let [k, v] of Object.entries(value)) value[k] = Number(v.toFixed(3));
			} else {
				value = Number(value.toFixed(3));
			}
			this.$emit(eventName, value);
			// if (eventName=='change') console.log('change')
		},
		textInputInputHandler(e) {
			const component = e.target.dataset.component;
			this.textInputsFreeze[component] = e.target.value;

			let output = { ...this.textInputsFreeze };

			if (output.hasOwnProperty('hex')) {
				// editing hex
				const a = output.a;
				output = tinycolor(output.hex);
				if (output.getFormat() !== 'hex8') {
					// unless hex8 is entered use existing alpha
					output.setAlpha(a);
				}
			} else {
				output = tinycolor(output);
			}

			const hsv = output.toHsv();

			if (this.textInputsFormat === 'hsl') {
				// editing in hsl
				if (hsv.h === 0) {
					// hue got converted to 0, use previous value
					hsv.h = parseInt(this.textInputsFreeze.h);
				}
				if (hsv.v === 0) {
					// fix for editing s but l is 0, so it converts to 0
					let s = this.textInputsFreeze.s;
					const isPercent = (s.indexOf('%') !== -1);
					s = parseFloat(s);
					if (!s || s < 0) s = 0;
					else if (isPercent || s > 1) {
						s = Math.min(s * 0.01, 1);
					}

					// convert to hsv
					const l = 0.001;
					const v = s * l + l;
					s = 2 - 2 * l / v;

					hsv.s = s;
				}
			}

			// assign new values with gate for the convertion noise
			const threshold = {
				h: .5,
				s: .001,
				v: .001,
			}
			if (component !== 'a') {
				// editing color component (not alpha)
				// gate and assign new values if change is over threshold
				Object.keys(hsv).filter(k => k !== 'a').forEach(k => {
					const oldVal = this[k];
					const newVal = hsv[k];
					if (Math.abs(oldVal - newVal) > threshold[k]) {
						this[k] = newVal;
					}
				});

				if (output.getFormat() === 'hex8' && output.getOriginalInput().length > 7) {
					// hex8 was entered into hex field
					if (!this.disableAlpha) {
						// alpha enabled, update it too
						this.a = hsv.a;
						this.textInputsFreeze.a = Number(this.a.toFixed(2));
					} else {
						// alpha disabled, treat the color as invalid
						Object.assign(this.$data, { h: 0, s: 0, v: 0 });
					}
				}
			} else {
				// editing alpha, assign it right away. Don't touch other components
				this.a = hsv.a;
			}
		},
		textInputFocusHandler(e) {
			// if focused from blur, freeze current color
			// if focused from another text input, don't update
			if (!this.textInputActive) {
				this.textInputsFreeze = { ...this.textInputs };
				this.colorSnapshot = this.color.toRgbString(); // this to track change
			}
			this.textInputActive = e.target.dataset.component;
		},
		textInputBlurHandler(e) {
			setTimeout(() => {
				if (this.textInputActive === e.target.dataset.component) {
					// actually blurred, not just focused another

					// check if something actually changed
					if (this.colorSnapshot !== this.color.toRgbString()) {
						// something changed, emit change hook
						this.emitHook('change', { h: this.h, s: this.s, v: this.v, a: this.a });
					}

					this.textInputsFreeze = {};
					this.textInputActive = null;
				}
			}, 0);
		},
		textInputFormatChange(dir) {
			const formats = ['rgb','name','hsl'];
			let currentFormat = this.textInputsFormat;
			if (currentFormat === 'hex') currentFormat = 'name'; // use name because name falls back to hex
			let i = formats.indexOf(this.textInputsFormat) + dir;
			if (i < 0) i = formats.length - 1;
			else if (i === formats.length) i = 0;
			this.textInputsFormat = formats[i];
		},
		getCanvasRects() {
			this.saturationCanvasRect = this.$refs.saturationCanvas.getBoundingClientRect();
			this.hueCanvasRect = this.$refs.hueCanvas.getBoundingClientRect();
			this.alphaCanvasRect = this.disableAlpha ? {} : this.$refs.alphaCanvas.getBoundingClientRect();
		},
		init() {
			const pickerRoot = this.$refs.pickerRoot;
			const computedStyle = window.getComputedStyle(pickerRoot);

			// get color values from model value
			Object.assign(this.$data, this.color.toHsv());

			// wait for picker to render (stealthy)
			// and then get all the necessary values that rely on element being displayed
			window.requestAnimationFrame(() => {
				// get picker size
				const { width, height } = pickerRoot.getBoundingClientRect();
				this.pickerHeight = height;
				this.pickerWidth = width;

				// get canvas rects and set initial values
				this.getCanvasRects();
				this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
				this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
				this.saturationTranslateX = this.s * this.saturationCanvasRect.width;
				this.saturationTranslateY = -this.v * this.saturationCanvasRect.height;
				this.sliderPointerWidth = this.$refs.huePointer.offsetWidth;
				this.saturationPointerWidth = this.$refs.saturationPointer.offsetWidth;
				this.saturationPointerHeight = this.$refs.saturationPointer.offsetHeight;

				// wait for it to hide
				// and then let the parent know picker is ready
				window.requestAnimationFrame(() => {
					this.$emit('ready');
				});
			});

			// get background-color to color the arrows
			const background = computedStyle.getPropertyValue('background-color');
			if (tinycolor(background).isDark()) {
				this.arrowColor = '#fbfbfb';
			}

		},
		fillCanvas() {
			// fill hue canvas
			let canvas = this.$refs.hueCanvas;
			let ctx = canvas.getContext('2d');
			let gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
			gradient.addColorStop(0, 'hsl(0,100%,50%)');
			gradient.addColorStop(.17, 'hsl(298.8, 100%, 50%)');
			gradient.addColorStop(.33, 'hsl(241.2, 100%, 50%)');
			gradient.addColorStop(.50, 'hsl(180, 100%, 50%)');
			gradient.addColorStop(.67, 'hsl(118.8, 100%, 50%)');
			gradient.addColorStop(.83, 'hsl(61.2,100%,50%)');
			gradient.addColorStop(1, 'hsl(360,100%,50%)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// fill saturation canvas
			canvas = this.$refs.saturationCanvas;
			ctx = canvas.getContext('2d');
			// white layer
			gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
			gradient.addColorStop(0, 'rgba(250,250,250,1)');
			gradient.addColorStop(1, 'rgba(250,250,250,0)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			// black layer
			gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
			gradient.addColorStop(0, 'rgba(0,0,0,1)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	},
	watch: {
		h(newVal, oldVal) {
			this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
			if (oldVal === undefined) return;
			this.emitUpdate();
			this.emitHook('hueInput', { h: this.h });
		},
		s(newVal, oldVal) {
			this.saturationTranslateX = this.s * this.saturationCanvasRect.width;
			if (oldVal === undefined) return;
			this.emitUpdate();
			this.emitHook('saturationInput', { s: this.s, v: this.v });
		},
		v(newVal, oldVal) {
			this.saturationTranslateY = -this.v * this.saturationCanvasRect.height;
			if (oldVal === undefined) return;
			this.emitUpdate();
			this.emitHook('saturationInput', { s: this.s, v: this.v });
		},
		a(newVal, oldVal) {
			this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
			if (oldVal === undefined) return;
			this.emitUpdate();
			this.emitHook('alphaInput', { a: this.a });
		},
	},
	mounted() {
		this.getCanvasRects();
		// this.init();
		this.fillCanvas();
	},
	beforeUnmount() {
	}
}

</script>

<style lang="scss">
	%fill-100 {
		width: 100%;
		height: 100%;
	}
	%flex-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	%slider-pointer {
		border-radius: 50%;
		background: #fbfbfb;
		overflow: hidden;
		border: 2px #fbfbfb solid;
		box-shadow: 0 0 5px rgba(15,15,15,.3);
	}
	%arrow {
		width: 12px;
		height: 10px;
		opacity: .4;
		transition: .3s;
		position: relative;
		@extend %flex-center;
		&::before {
			display: block;
			content: '';
			width: 0;
			height: 0;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
		}
		&:hover {
			opacity: .8;
		}
	}
	.color-input {
		&__popup {
			position: absolute;
			z-index: 9999;
			width: auto;
			min-width: 280px;
			background-color: #fbfbfb;
			box-shadow: 0px 5px 10px rgba(15, 15, 15, 0.4);
			user-select: none;
			color: #0f0f0f;
			--popup-offset: 10px;
			&--top {
			  translate: 0 calc(var(--popup-offset) * -1);
			}
			&--bottom {
			  translate: 0 var(--popup-offset);
			}
			&--center-right {
				translate: var(--popup-offset) 0;
			}
			&--center-left {
				translate: calc(var(--popup-offset) * -1) 0;
			}
			&--enter-from,
			&--leave-to {
				transform: translateY(-10px);
				opacity: 0;
			}
			&--enter-active,
			&--leave-active {
				transition: transform 0.3s, opacity 0.3s;
			}
		}
		&__slider {
			width: 85%;
			height: 6px;
			margin: 18px auto;
			position: relative;
		}
		&__slider-container {
			display: block;
			@extend %fill-100;
			top: 50%;
			border-radius: 3px;
			overflow: hidden;
			background-size: contain;
		}
		&__slider-canvas {
			@extend %fill-100;
			display: block;
		}
		&__slider-active-area {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			left: 0;
			width: 100%;
		}
		&__slider-pointer {
			@extend %slider-pointer;
			width: 12px;
			height: 12px;
		}
		&__pointer-color {
			@extend %fill-100;
		}
		&__pointer-transparent {
			@extend %fill-100;
			background-size: auto 100%;
		}
		&__saturation-area {
			width: 100%;
			height: 125px;
			position: relative;
		}
		&__saturation-pointer {
			@extend %slider-pointer;
			top: auto;
			width: 20px;
			height: 20px;
			position: absolute;
			bottom: 0;
			left: 0;
			z-index: 10001;
		}
		&__text-inputs-area {
			display: flex;
			margin: 0 7px 10px;
		}
		&__text-inputs-wrapper {
			flex: 1 0;
			@extend %flex-center;
			flex-wrap: wrap;
		}
		&__text-input-container {
			white-space: nowrap;
		}
		&__text-input {
			font-family: inherit;
			color: inherit;
			width: 4ch;
			text-align: center;
			margin: 0 5px;
			background: transparent;
			border-style: solid;
			border-width: 1px;
			border-radius: 3px;
			&:focus {
				outline-color: var(--outline-color);
			}
			&--hex {
				width: 8ch;
			}
		}
		&__text-format-arrows {
			flex: 0 1;
			@extend %flex-center;
			flex-direction: column;
		}
		&__arrow-up {
			@extend %arrow;
			&::before {
				border-bottom: 5px solid var(--arrow-color);
			}
		}
		&__arrow-down {
			@extend %arrow;
			&::before {
				border-top: 5px solid var(--arrow-color);
			}
		}
	}
</style>
