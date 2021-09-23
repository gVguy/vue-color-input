<template>
	<div :class="['color-input-box', 'user', { active }]"
	:style="boxStyles"
	@click.stop="pickStart"
	ref="colorInputBox">
		<transition name="color-input-picker" @after-enter="afterEnterHandler">
			<color-picker
			class="color-input-picker user"
			:color="this.color"
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
		props: ['modelValue'],
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
			}
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
			}
		},
		created() {
			if (!this.color.isValid()) {
				console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			}
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
	.color-input-box {
		position: relative;
		display: inline-block;
		width: 40px;
		height: 40px;
		cursor: pointer;
		border-radius: 5px;
   	box-sizing: border-box;
		border: 2px transparent solid;
		transition: all .2s, background 0s;
	}
	.color-input-box.active {
		border-color: #fbfbfb;
	}
	.color-input-picker {
		position: absolute;
		z-index: 9999;
		top: 100%;
		margin-top: 10px;
		cursor: auto;
		width: 250px;
		background-color: #fbfbfb;
		box-shadow: 0px 5px 10px rgba(15,15,15,.4);
	}
	.color-input-picker-enter-from,
	.color-input-picker-leave-to {
		transform: translateY(-10px);
		opacity: 0;
	}
	.color-input-picker-enter-active,
	.color-input-picker-leave-active {
		transition: .3s;
	}
</style>