<template>
	<div :class="['color-input-box', 'user', { active }]"
	:style="boxStyles"
	@click="pickStart"
	ref="colorInputBox">
		<transition :name="enableTransition ? 'color-input-picker' : ''">
			<div class="color-input-picker user" v-if="active">
				<div class="hue-area">
					<canvas ref="hueCanvas"></canvas>
					<div class="hue-dot"></div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
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
  		],
		data() {
			return {
				active: true,
			}
		},
		computed: {
			color() {
				return tinycolor(this.modelValue);
			},
			hsl() {
				return this.color.toHsl();
			},
			boxStyles() {
				return {
					background: this.color.toHslString()
				}
			}
		},
		methods: {
			pickStart(e) {
				if (this.active) return;
				e.stopPropagation();
				this.active = true;
				document.addEventListener('click', this.pickEnd);
				this.$emit('pickStart');
			},
			pickEnd(e) {
				if (hasClassRecursive(e.target, 'color-input-picker')) return;
				document.removeEventListener('click', this.pickEnd);
				this.active = false;
				this.$emit('pickEnd');
			},
			emitUpdate(color) {
				let output;
				const format = this.color.getFormat();
				if (typeof this.modelValue === 'string') {
					output = color.toString(format);
				} else {
					output = color['to' + format.charAt(0).toUpperCase() + format.slice(1)]();
				}
				this.$emit('update:modelValue', output);
			}
		},
		created() {
			// validate color
			if (!this.color.isValid()) console.warn('[vue-color-input]: invalid color -> ' + this.color.getOriginalInput());
			this.enableTransition = false;
		},
		beforeMount() {
		},
		mounted() {
			console.log(this.$refs.hueCanvas);
			// draw canvas
			let canvas = this.$refs.hueCanvas;
			let ctx = canvas.getContext('2d');
			let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			// gradient.addColorStop(0.00, 'hsl(0,100%,50%)');
			// gradient.addColorStop(0.17, 'hsl(298.8, 100%, 50%)');
			// gradient.addColorStop(0.33, 'hsl(241.2, 100%, 50%)');
			// gradient.addColorStop(0.50, 'hsl(180, 100%, 50%)');
			// gradient.addColorStop(0.67, 'hsl(118.8, 100%, 50%)');
			// gradient.addColorStop(0.83, 'hsl(61.2,100%,50%)');
			// gradient.addColorStop(1.00, 'hsl(360,100%,50%)');
			// ctx.fillStyle = gradient;
			ctx.fillStyle = 'green';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// this.active = false;
			setTimeout(() => this.active = false, 1000);
			this.$nextTick(() => this.enableTransition = true);
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

	.hue-area {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.hue-area canvas {
		width: 100%;
		height: 100%;
	}
</style>
