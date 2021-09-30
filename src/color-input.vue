<template>
	<div class="color-input override"
	ref="boxRoot"
	:style="cssVars">
		<div :class="['box', { active, disabled }]"
		@click.stop="pickStart"
		ref="box">
			<div class="box-transparent">
				<div class="box-color" :style="boxColorStyles"></div>
			</div>
		</div>
		<transition :name="transition" @after-enter="afterEnterHandler">
			<color-picker
			class="picker-popup"
			:color="this.color"
			:position="processedPosition"
			:disable-alpha="disableAlpha"
			:boxRect="boxRect"
			:text-inputs="textInputs"
			:disable-text-inputs="disableTextInputs"
			v-if="active"
			@updateColor="emitUpdate"
			@textInputFormatChange="textInputFormatChange"
			@hueInputStart="$emit('hueInputStart', $event)"
			@hueInputEnd="$emit('hueInputEnd', $event)"
			@hueInput="$emit('hueInput', $event)"
			@alphaInputStart="$emit('alphaInputStart', $event)"
			@alphaInputEnd="$emit('alphaInputEnd', $event)"
			@alphaInput="$emit('alphaInput', $event)"
			@saturationInputStart="$emit('saturationInputStart', $event)"
			@saturationInputEnd="$emit('saturationInputEnd', $event)"
			@saturationInput="$emit('saturationInput', $event)"
			ref="picker" />
		</transition>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorPicker from './components/color-picker.vue'
	const tinycolor = require("tinycolor2");

	import transparentPattern from '@/assets/method-transparent-pattern.svg';

	const isSameNodeRecursive = (elA, elB) => {
		while (!/^(body|html)$/i.test(elA.tagName)) {
			if (elA === elB) return true;
			elA = elA.parentNode;
		}
		return false;
	}

	export default /*#__PURE__*/defineComponent({
		name: 'ColorInput',
		props: {
			modelValue: [String, Object],
			position: String,
			transition: {
				type: String,
				default: 'color-input-picker-popup'
			},
			disableAlpha: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			disableTextInputs: {
				type: Boolean,
				default: false
			},
			format: String,
		},
  		emits: [
  			'update:modelValue',
  			'pickStart',
  			'pickEnd',
			'hueInputStart',
			'hueInputEnd',
			'hueInput',
			'alphaInputStart',
			'alphaInputEnd',
			'alphaInput',
			'saturationInputStart',
			'saturationInputEnd',
			'saturationInput'
  		],
  		components: { ColorPicker },
  		provide: { tinycolor },
		data() {
			return {
				color: null,
				active: false,
				boxRect: {},
				innerBoxRect: {},
				textInputsFormat: null,
			}
		},
		computed: {
			boxColorStyles() {
				return {
					background: this.color.toRgbString()
				}
			},
			processedPosition() {
				// array of all valid position combination
				const values = ['top','right','bottom','left','center'];
				const conflicts = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }
				const combinations = values.slice(0,4).flatMap((v, i) => values.map(q => {
					if (conflicts[v] === q) return false;
					return v === q ? v : v + ' ' + q;
				})).filter(v => v);

				let position = this.position;
				if (!combinations.includes(position)) {
					if (position) {
						//position is defined but invalid
						console.warn('[vue-color-input]: invalid position -> ' + this.position);
					}
					position = 'bottom center';
				}
				position = position.split(' ');
				position[1] = position[1] || 'center';

				return position;
			},
			processedFormat() {
				let formats = ['rgb', 'hsv', 'hsl'];
				formats = formats.concat(formats.flatMap(f => {
					return [f + ' object', 'object ' + f, f + ' string', 'string ' + f]
				}));
				console.log(formats);
			},
			textInputs() {
				let format = this.textInputsFormat;
				let values = {};
				if (['name','hex'].includes(format)) {
					values.hex = this.color.toString(format);
				} else {
					const stringSplit = this.color.toString(format).split('(')[1].slice(0,-1).split(', ');
					format.split('').forEach((k, i) => values[k] = stringSplit[i]);
				}
				if (!this.disableAlpha) {
					values.a = Number(this.color.getAlpha().toFixed(2));
				}
				return values;
			},
			cssVars() {
				return {
					'--transparent-pattern': 'url(' + transparentPattern + ')'
				}
			},
		},
		methods: {
			afterEnterHandler(e) {
				this.$refs.picker.getCanvasRects();
			},
			pickStart(e) {
				if (this.active || this.disabled) return;
				this.getBoxRect();
				this.active = true;
				document.body.addEventListener('pointerdown', this.pickEnd);
				this.$emit('pickStart');
			},
			pickEnd(e) {
				if (!this.active || e && isSameNodeRecursive(e.target, this.$refs.picker.$refs.pickerRoot)) return;
				document.body.removeEventListener('pointerdown', this.pickEnd);
				this.active = false;
				this.$emit('pickEnd');
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
			init() {
				// get color
				this.color = tinycolor(this.modelValue);

				// store original format (this is the format modelValue will be converted to)
				this.originalFormat = this.format || this.color.getFormat();

				// for storing output value (to react to external modelValue changes)
				this.output = null;

				// initial format for text inputs
				let textInputsFormat = this.originalFormat;
				// remove digit eg hex8 & if invalid or hsv go with rgb
				textInputsFormat = (!textInputsFormat || textInputsFormat === 'hsv') ? 'rgb' : textInputsFormat.replace(/\d/,'');
				this.textInputsFormat = textInputsFormat;
			},
			emitUpdate(hsv) {
				this.color = tinycolor(hsv);
				let format = this.originalFormat;
				if (hsv.a < 1 && ['hex','name'].includes(format) || format === false) {
					// original format lacks alpha channel or invalid color
					// output rgb instead
					format = 'rgb';
				}
				if (typeof this.modelValue === 'object') {
					this.output = this.color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
				} else {
					this.output = this.color.toString(format);
				}
				this.$emit('update:modelValue', this.output);
			},
			getBoxRect() {
				this.boxRect = this.$refs.boxRoot.getBoundingClientRect();
			}
		},
		created() {
			this.init();

			// warn of invalid color
			if (!this.color.isValid()) {
				console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			}
		},
		mounted() {
		},
		beforeUnmount() {
			this.pickEnd();
		},
		watch: {
			modelValue() {
				let input = typeof this.modelValue === 'object' ? JSON.stringify(this.modelValue) : this.modelValue;
				let output = typeof this.output === 'object' ? JSON.stringify(this.output) : this.output;
				if (input !== output) {
					// modelValue updated from elsewhere
					// update color data
					this.init();
				}
			},
			disabled() {
				this.pickEnd();
			},
			disableAlpha(newVal) {
				if (newVal) {
					// alpha disabled
					// update model value to no alpha
					this.color.setAlpha(1);
					this.emitUpdate(this.color.toHsv());
				}
				if (this.active) this.$nextTick(function() { 
					this.$refs.picker.init();
				});
			}
		}
	});
</script>

<style scoped>
	.color-input {
		position: relative;
		display: inline-block;
		color: #0f0f0f;
	}
	.box {
		width: 40px;
		height: 40px;
		cursor: pointer;
		border-radius: 5px;
		box-sizing: border-box;
		border: 2px transparent solid;
		transition: all .2s, background 0s;
		overflow: hidden;
	}
	.box.active {
		border-color: #fbfbfb;
	}
	.box.disabled {
		cursor: not-allowed;
	}
	.box-transparent {
		width: 100%;
		height: 100%;
		background-image: var(--transparent-pattern);
		background-size: 50%;
	}
	.box-color {
		width: 100%;
		height: 100%;
	}
	.picker-popup {
		position: absolute;
		z-index: 9999;
		width: auto;
		min-width: 280px;
		background-color: #fbfbfb;
		box-shadow: 0px 5px 10px rgba(15,15,15,.4);
		margin: 10px;
		user-select: none;
	}
	.color-input-picker-popup-enter-from,
	.color-input-picker-popup-leave-to {
		transform: translateY(-10px);
		opacity: 0;
	}
	.color-input-picker-popup-enter-active,
	.color-input-picker-popup-leave-active {
		transition: transform .3s, opacity .3s;
	}
</style>