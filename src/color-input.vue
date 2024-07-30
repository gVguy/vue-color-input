<template>
	<div class="color-input user"
	ref="root"
	:style="cssVars">
		<div :class="['box', { active, disabled }]"
		@click.stop="pickStart"
		ref="box">
				<div class="inner transparent">
					<div class="color" :style="boxColorStyles"></div>
				</div>
		</div>

		<Teleport :to="parent" v-if="parent">
			<transition :name="transition">
				<color-picker
				class="picker-popup user"
				:color="this.color"
				:position="processedPosition"
				:disable-alpha="processedDisableAlpha"
				:boxRect="boxRect"
				:disable-text-inputs="disableTextInputs"
				v-show="active"
				:style="{ visibility: hidePicker ? 'hidden' : '' }"
				@ready="hidePicker = false"
				@updateColor="emitUpdate"
				@hueInputStart="$emit('hueInputStart', $event)"
				@hueInputEnd="$emit('hueInputEnd', $event)"
				@hueInput="$emit('hueInput', $event)"
				@alphaInputStart="$emit('alphaInputStart', $event)"
				@alphaInputEnd="$emit('alphaInputEnd', $event)"
				@alphaInput="$emit('alphaInput', $event)"
				@saturationInputStart="$emit('saturationInputStart', $event)"
				@saturationInputEnd="$emit('saturationInputEnd', $event)"
				@saturationInput="$emit('saturationInput', $event)"
				@change="$emit('change', $event)"
				ref="picker" />
			</transition>
		</Teleport>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorPicker from './components/color-picker.vue'

	import tinycolor from 'tinycolor2';

	import transparentPattern from '@/assets/transparent-pattern.svg';

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
			position: {
				type: String,
				default: 'bottom'
			},
			transition: {
				type: String,
				default: 'picker-popup'
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
			appendTo: [String, HTMLElement]
		},
  		emits: [
  			'mounted',
  			'beforeUnmount',
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
				'saturationInput',
				'change'
  		],
  		components: { ColorPicker },
  		provide: { tinycolor },
		data() {
			return {
				color: null,
				active: false,
				ready: false,
				hidePicker: false,
				parent: null,
				boxRect: {},
				innerBoxRect: {},
				textInputsFormat: 'rgb',
				originalFormat: 'rgb',
				originalType: null,
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

				let position = this.position.toLowerCase(); // allow 'bOtToM RiGHt'
				if (!combinations.includes(position)) {
					if (position) {
						// position is defined but invalid
						console.warn('[vue-color-input]: invalid position -> ' + position);
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
				formats = formats.concat(['name', 'hex', 'hex8'].flatMap(f => {
					return [f, f + ' string', 'string ' + f]
				}));

				// validate and fallback to default
				let format = this.format;
				let force = false; // this will represent whether the resulting format is coming from the input or forced by user
				if (format) {
					// format is defined
					format = format.toLowerCase(); // allow 'rGb StRinG'
					if (!formats.includes(format)) {
						// format is defined but invalid
						console.warn('[vue-color-input]: invalid format -> ' + format);
						format = this.originalFormat;
					} else {
						// user-defined format is valid
						force = true;
					}
				} else {
					// format is undefined
					format = this.originalFormat;
				}

				// extract type and format separately
				format = format.split(' ');
				let type = format.findIndex(f => ['string','object'].includes(f));
				if (type < 0) {
					// type not specified use type from input
					type = ['rgb', 'hsv', 'hsl'].includes(format[0]) ? this.originalType : 'string';
				} else {
					// type specified
					type = format.splice(type, 1)[0];
				}
				format = format[0];

				return { type, format, force }
			},
			processedDisableAlpha() {
				const format = this.processedFormat;
				if (format.force && ['hex','name'].includes(format.format)) {
					return true;
				} else {
					return this.disableAlpha;
				}
			},
		},
		methods: {
			pickStart(e) {
				if (this.active || this.disabled) return;
				this.getBoxRect();
				this.active = true;

				// init the picker before showing in case there were some changes to its layout
				this.ready = false; // picker will emit 'ready' at the end of init
				this.hidePicker = true;
				this.$refs.picker.init();

				document.body.addEventListener('pointerdown', this.pickEnd);
				this.$emit('pickStart');
			},
			pickEnd(e) {
				if (!this.active || e && isSameNodeRecursive(e.target, this.$refs.picker.$refs.pickerRoot)) return;
				document.body.removeEventListener('pointerdown', this.pickEnd);
				this.active = false;
				this.$emit('pickEnd');
			},
			init() {
				// get color
				this.color = tinycolor(this.modelValue);

				// original format (this is the format modelValue will be converted to)
				let format = this.color.getFormat();
				this.originalFormat = (format) ? format : 'rgb';
				let type = typeof this.modelValue;
				this.originalType = (['string', 'object'].includes(type)) ? type : 'string';
				this.processedFormat; // trigger computed processedFormat()

				// for storing output value (to react to external modelValue changes)
				this.output = null;

				// warn of invalid color
				if (!this.color.isValid()) {
					console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
				}
			},
			emitUpdate(hsv) {
				// if new value specified, update color, otherwise emit update with existing color
				if (hsv) this.color = tinycolor(hsv);

				let format = this.processedFormat.format;
				if (this.color.getAlpha() < 1 && ['hex','name'].includes(format)) {
					// alpha < 1 but output format lacks alpha channel
					if (this.processedFormat.force) {
						// format is user defined, output it anyway
						this.color.setAlpha(1);
					} else {
						// format is calculate from input, output rgb instead
						format = 'rgb';
					}
				}
				if (this.processedFormat.type === 'object') {
					this.output = this.color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
				} else {
					this.output = this.color.toString(format);
				}
				this.$emit('update:modelValue', this.output);
			},
			getParent() {
				let parent;
				if (this.appendTo) {
					if (typeof this.appendTo === 'string') {
						parent = document.querySelector(this.appendTo)
					} else {
						parent = this.appendTo
					}
				}

				
				this.parent = parent || this.$refs.root
				console.log(this.parent);
			},
			getBoxRect() {
				this.boxRect = this.parent.getBoundingClientRect();
			}
		},
		created() {
			this.init();
			this.cssVars = {
				'--transparent-pattern': 'url(' + transparentPattern + ')'
			};
		},
		mounted() {
			this.getParent();
			this.$emit('mounted');
		},
		beforeUnmount() {
			this.pickEnd();
			this.$emit('beforeUnmount');
		},
		watch: {
			modelValue() {
				let input = typeof this.modelValue === 'object' ? JSON.stringify(this.modelValue) : this.modelValue;
				let output = typeof this.output === 'object' ? JSON.stringify(this.output) : this.output;
				if (input !== output) {
					// modelValue updated from elsewhere
					// update color data
					this.init();
					// if active at the moment, update picker as well
					if (this.active) {
						this.$nextTick(function() {
							this.$refs.picker.init();
						});
					}
				}
			},
			disabled() {
				this.pickEnd();
			},
			processedDisableAlpha(newVal) {
				if (newVal) {
					// alpha disabled
					// update model value to no alpha
					this.color.setAlpha(1);
					this.emitUpdate();
				}
				if (this.active) this.$nextTick(function() { 
					this.$refs.picker.init();
				});
			},
			format() {
				this.emitUpdate();
			}
		}
	});
</script>

<style lang="scss">
	%fill-100 {
		width: 100%;
		height: 100%;
	}
	.color-input {
		position: relative;
		display: inline-block;

		.box {
			width: 40px;
			height: 40px;
			cursor: pointer;
			border-radius: 20%;
			overflow: hidden;
			transition: all .2s, background-color 0.05s .15s;
			.inner {
				border-radius: inherit;
				overflow: hidden;
				transition: inherit;
			}
			.transparent {
				@extend %fill-100;
				background-image: var(--transparent-pattern);
				background-color: #fff;
				background-size: 100%;
			}
			.color {
				@extend %fill-100;
			}
			&.active {
				background: #fbfbfb;
				transition: all .2s, background-color 0.05s;
				.inner {
					transform: scale(.9);
				}
			}
			&.disabled {
				cursor: not-allowed;
			}
		}
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
		color: #0f0f0f;
	}

	.picker-popup-enter-from,
	.picker-popup-leave-to {
		transform: translateY(-10px);
		opacity: 0;
	}
	.picker-popup-enter-active,
	.picker-popup-leave-active {
		transition: transform .3s, opacity .3s;
	}
</style>