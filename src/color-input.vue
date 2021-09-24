<template>
	<div class="color-input-container">
		<div :class="['color-input-box', 'user', { active }]"
		@click.stop="pickStart"
		ref="colorInputBox">
			<div class="box-transparent">
				<div class="box-color" :style="boxStyles"></div>
			</div>
		</div>
		<transition name="color-input-picker" @after-enter="afterEnterHandler">
			<color-picker
			class="color-input-picker user"
			:color="this.color"
			:position="processedPosition"
			:boxSize="{ width: boxWidth, height: boxHeight }"
			v-if="active"
			@updateColor="emitUpdate"
			@huePickStart="$emit('huePickStart', $event)"
			@huePickEnd="$emit('huePickEnd', $event)"
			@alphaPickStart="$emit('alphaPickStart', $event)"
			@alphaPickEnd="$emit('alphaPickEnd', $event)"
			@saturationPickStart="$emit('saturationPickStart', $event)"
			@saturationPickEnd="$emit('saturationPickEnd', $event)"
			ref="colorPicker" />
		</transition>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorPicker from './components/color-picker.vue'
	const tinycolor = require("tinycolor2");

	const hasClassRecursive = (el, className) => {
		while (!/^(body|html)$/i.test(el.tagName)) {
			if (el.className.split(' ').includes(className)) return true;
			el = el.parentNode;
		}
		return false;
	}

	export default /*#__PURE__*/defineComponent({
		name: 'ColorInput',
		props: {
			modelValue: [String, Object],
			position: String
		},
  		emits: [
  			'update:modelValue',
  			'pickStart',
  			'pickEnd',
			'huePickStart',
			'huePickEnd',
			'alphaPickStart',
			'alphaPickEnd',
			'saturationPickStart',
			'saturationPickEnd',
  		],
  		components: { ColorPicker },
		data() {
			return {
				active: false,
				output: null,
				originalColor: tinycolor(this.modelValue),
				boxWidth: 0,
				boxHeight: 0,
			}
		},
		computed: {
			color() {
				return tinycolor(this.modelValue);
			},
			boxStyles() {
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
				if (!combinations.includes(position)) position = 'bottom center';
				position = position.split(' ');
				position[1] = position[1] || 'center';

				return position;
			},
		},
		methods: {
			afterEnterHandler(e) {
				this.$refs.colorPicker.getCanvasRects();
			},
			pickStart(e) {
				if (this.active) return;
				this.active = true;
				document.body.addEventListener('mousedown', this.pickEnd);
				this.$emit('pickStart');
			},
			pickEnd(e) {
				if (hasClassRecursive(e.target, 'color-input-picker')) return;
				document.body.removeEventListener('mousedown', this.pickEnd);
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
			getBoxSize() {
				const { width, height } = this.$refs.colorInputBox.getBoundingClientRect();
				this.boxWidth = width;
				this.boxHeight = height;
				console.log('box size updated: ' + this.boxWidth + ', ' + this.boxHeight);
			}
		},
		created() {
			if (!this.color.isValid()) {
				console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			}
		},
		mounted() {
			this.getBoxSize();
			new ResizeObserver(this.getBoxSize).observe(this.$refs.colorInputBox);
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
	.color-input-container {
		position: relative;
		display: inline-block;
	}
	.color-input-box {
		width: 40px;
		height: 40px;
		cursor: pointer;
		border-radius: 5px;
   	box-sizing: border-box;
		border: 2px transparent solid;
		transition: all .2s, background 0s;
		overflow: hidden;
	}
	.color-input-box.active {
		border-color: #fbfbfb;
	}
	.box-transparent {
		width: 100%;
		height: 100%;
		background-image: url('./assets/method-transparent-pattern.svg');
	}
	.box-color {
		width: 100%;
		height: 100%;
	}
	.color-input-picker {
		position: absolute;
		z-index: 9999;
		width: 250px;
		background-color: #fbfbfb;
		box-shadow: 0px 5px 10px rgba(15,15,15,.4);
		margin: 10px;
	}
	.color-input-picker-enter-from,
	.color-input-picker-leave-to {
		transform: translateY(-10px);
		opacity: 0;
	}
	.color-input-picker-enter-active,
	.color-input-picker-leave-active {
		transition: transform .3s, opacity .3s;
	}
</style>