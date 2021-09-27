<template>
	<div class="color-input override"
	ref="boxRoot">
		<div :class="['box', { active }]"
		@click.stop="pickStart"
		ref="box">
			<div class="box-transparent" :style="boxTransparentStyles">
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
			v-if="active"
			@updateColor="emitUpdate"
			@huePickStart="$emit('huePickStart', $event)"
			@huePickEnd="$emit('huePickEnd', $event)"
			@hueChange="$emit('hueChange', $event)"
			@alphaPickStart="$emit('alphaPickStart', $event)"
			@alphaPickEnd="$emit('alphaPickEnd', $event)"
			@alphaChange="$emit('alphaChange', $event)"
			@saturationPickStart="$emit('saturationPickStart', $event)"
			@saturationPickEnd="$emit('saturationPickEnd', $event)"
			@saturationChange="$emit('saturationChange', $event)"
			ref="picker" />
		</transition>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorPicker from './components/color-picker.vue'
	const tinycolor = require("tinycolor2");

	// const hasClassRecursive = (el, className) => {
	// 	while (!/^(body|html)$/i.test(el.tagName)) {
	// 		if (el.className.split(' ').includes(className)) return true;
	// 		el = el.parentNode;
	// 	}
	// 	return false;
	// }

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
			}
		},
  		emits: [
  			'update:modelValue',
  			'pickStart',
  			'pickEnd',
			'huePickStart',
			'huePickEnd',
			'hueChange',
			'alphaPickStart',
			'alphaPickEnd',
			'alphaChange',
			'saturationPickStart',
			'saturationPickEnd',
			'saturationChange'
  		],
  		components: { ColorPicker },
		data() {
			return {
				active: false,
				output: null,
				originalColor: tinycolor(this.modelValue),
				boxRect: {},
				innerBoxRect: {},
			}
		},
		computed: {
			color() {
				const color = tinycolor(this.modelValue);
				if (this.disableAlpha) color.setAlpha(1);
				return color;
			},
			boxColorStyles() {
				return {
					background: this.color.toRgbString()
				}
			},
			boxTransparentStyles() {
				return {
					// backgroundSize: Math.min(this.$refs.box.clientWidth, this.$refs.box.clientHeight) * 0.5 + 'px'
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
				if (!combinations.includes(position)) position = 'bottom center';
				position = position.split(' ');
				position[1] = position[1] || 'center';

				return position;
			},
		},
		methods: {
			afterEnterHandler(e) {
				console.log('enter complete');
				this.$refs.picker.getCanvasRects();
			},
			pickStart(e) {
				if (this.active) return;
				this.getBoxRect();
				this.active = true;
				document.body.addEventListener('pointerdown', this.pickEnd);
				this.$emit('pickStart');
			},
			pickEnd(e, force) {
				if (!force && isSameNodeRecursive(e.target, this.$refs.picker.$refs.pickerRoot)) return;
				document.body.removeEventListener('pointerdown', this.pickEnd);
				this.active = false;
				this.$emit('pickEnd');
			},
			emitUpdate(hsv) {
				const color = tinycolor(hsv);
				let format = this.originalColor.getFormat();
				if (hsv.a < 1 && ['hex','name'].includes(format) || format === false) {
					// original format lacks alpha channel or invalid color
					// output rgb instead
					format = 'rgb';
				}
				if (typeof this.modelValue !== 'object') {
					this.output = color.toString(format);
				} else {
					this.output = color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
				}
				this.$emit('update:modelValue', this.output);
			},
			getBoxRect() {
				this.boxRect = this.$refs.boxRoot.getBoundingClientRect();
			}
		},
		created() {
			if (!this.color.isValid()) {
				console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			}
		},
		mounted() {
			console.log('color input mounted');
		},
		beforeUnmount() {
			if (this.active) this.pickEnd({}, true);
			console.log('color input unmounting');
		},
		watch: {
			modelValue() {
				let input = typeof this.modelValue === 'object' ? JSON.stringify(this.modelValue) : this.modelValue;
				let output = typeof this.output === 'object' ? JSON.stringify(this.output) : this.output;
				if (input !== output) {
					// modelValue updated from elsewhere
					// update color data
					console.log('new model value');
					this.originalColor = this.color;
				}
			}
		}
	});
</script>

<style scoped>
	.color-input {
		position: relative;
		display: inline-block;
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
	.box-transparent {
		width: 100%;
		height: 100%;
		background-image: url('./assets/method-transparent-pattern.svg');
		background-size: 50%;
	}
	.box-color {
		width: 100%;
		height: 100%;
	}
	.picker-popup {
		position: absolute;
		z-index: 9999;
		width: 250px;
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