<template>
	<div :class="['color-input-box', 'user', { active }]"
	:style="boxStyles"
	@click.stop="pickStart"
	ref="colorInputBox">
		<transition name="color-input-picker">
			<color-picker
			class="color-input-picker user" v-if="active"
			:color="this.color"
			@updateColor="emitUpdate"
			@huePickStart="$emit('huePickStart', $event)"
			@huePickEnd="$emit('huePickEnd', $event)"
			@alphaPickStart="$emit('alphaPickStart', $event)"
			@alphaPickEnd="$emit('alphaPickStart', $event)" />
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
  		],
  		components: { ColorPicker },
		data() {
			return {
				active: false,
			}
		},
		computed: {
			color() {
				return tinycolor(this.modelValue);
			},
			// hsl: {
			// 	get() {
			// 		return this.color.toHsl();
			// 	},
			// 	set(hsl) {
			// 		const color = tinycolor(hsl);
			// 		let output;
			// 		let format = this.color.getFormat();
			// 		if (hsl.a < 1 && format === 'hex') format = 'hex8';
			// 		if (typeof this.modelValue !== 'object') {
			// 			output = color.toString(format);
			// 		} else {
			// 			output = color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
			// 		}
			// 		this.$emit('update:modelValue', output);
			// 	}
			// },
			boxStyles() {
				return {
					background: this.color.toRgbString()
				}
			}
		},
		methods: {
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
			emitUpdate(hsl) {
				const color = tinycolor(hsl);
				let output;
				let format = this.color.getFormat();
				if (hsl.a < 1 && format === 'hex') format = 'hex8';
				if (typeof this.modelValue !== 'object') {
					output = color.toString(format);
				} else {
					output = color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
				}
				this.$emit('update:modelValue', output);
			}
			// emitUpdate(color) {
			// 	let output;
			// 	const format = this.color.getFormat();
			// 	if (typeof this.modelValue === 'string') {
			// 		output = color.toString(format);
			// 	} else {
			// 		output = color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
			// 	}
			// 	this.$emit('update:modelValue', output);
			// }
		},
		created() {
			if (!this.color.isValid()) {
				console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			}
		},
		beforeMount() {
		},
		mounted() {
			console.log(this.color);
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
		transition: .2s;
	}
	.color-input-box.active {
		border-color: #0f0f0f;
	}
	.color-input-picker {
		position: absolute;
		z-index: 9999;
		top: 100%;
		left: -2px;
		margin-top: 10px;
		cursor: auto;
		width: 250px;
		height: 100px;
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

/*	.hue-area {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.hue-area canvas {
		width: 100%;
		height: 100%;
	}*/
</style>
