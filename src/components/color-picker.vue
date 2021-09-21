<template>
	<div>
		<div class="slider-area" @mousedown.prevent="huePickStart">
			<div class="slider">
				<canvas class="slider-canvas" ref="hueCanvas"></canvas>
			</div>
			<div class="slider-pointer" ref="huePointer" :style="huePointerStyles"></div>
		</div>
		<div class="slider-area" @mousedown.prevent="alphaPickStart">
			<div class="slider">
				<div class="slider-canvas" ref="alphaCanvas" :style="alphaCanvasStyles"></div>
			</div>
			<div class="slider-pointer" ref="alphaPointer" :style="alphaPointerStyles"></div>
		</div>
		<!-- <input type="range" v-model="h" min="0" max="360"> -->
	</div>
</template>

<script>

export default {
	name: 'ColorPicker',
	props: ['color', 'rgbString'],
	emits: [
		'updateColor',
		'huePickStart',
		'huePickEnd',
		'alphaPickStart',
		'alphaPickEnd',
	],
	data() {
		return {
			...this.color.toHsl(),
			hueTranslateX: 0,
			alphaTranslateX: 0,
			sliderPointerWidth: 0,
		}
	},
	computed: {
		// h: {
		// 	get() {
		// 		return this.modelValue.h;
		// 	},
		// 	set(h) {
		// 		const hsl = { ...this.modelValue, h };
		// 		this.$emit('update:modelValue', hsl);
		// 	}
		// },
		huePointerStyles() {
			return {
				background: 'hsl(' + this.h + ',100%,50%)',
				transform: 'translateX(' + (this.hueTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		alphaPointerStyles() {
			return {
				background: this.color.toRgbString(),
				transform: 'translateX(' + (this.alphaTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		alphaCanvasStyles() {
			return {
				background: 'linear-gradient(90deg, transparent 0%, ' + this.color.toHexString() + ' 100%)'
			}
		}
	},
	methods: {
		huePickStart(e) {
			document.addEventListener('mouseup', this.huePickEnd);
			document.addEventListener('mousemove', this.huePickMove);
			this.huePickMove(e);
			this.$emit('huePickStart', this.h);
		},
		huePickEnd(e) {
			document.removeEventListener('mouseup', this.huePickEnd);
			document.removeEventListener('mousemove', this.huePickMove);
			this.$emit('huePickEnd', this.h);
		},
		huePickMove(e) {
			if (e.pageX >= this.hueCanvasRect.x && e.pageX <= this.hueCanvasRect.right) {
				this.h = (e.pageX - this.hueCanvasRect.x) * 360 / this.hueCanvasRect.width;
			} else if (e.pageX < this.hueCanvasRect.x) this.h = 0;
			else this.h = 360;
		},
		alphaPickStart(e) {
			document.addEventListener('mouseup', this.alphaPickEnd);
			document.addEventListener('mousemove', this.alphaPickMove);
			this.alphaPickMove(e);
			this.$emit('alphaPickStart', this.a);
		},
		alphaPickEnd(e) {
			document.removeEventListener('mouseup', this.alphaPickEnd);
			document.removeEventListener('mousemove', this.alphaPickMove);
			this.$emit('alphaPickEnd', this.a);
		},
		alphaPickMove(e) {
			if (e.pageX >= this.alphaCanvasRect.x && e.pageX <= this.alphaCanvasRect.right) {
				this.a = (e.pageX - this.alphaCanvasRect.x) / this.alphaCanvasRect.width;
			} else if (e.pageX < this.alphaCanvasRect.x) this.a = 0;
			else this.a = 1;
		},
		emitUpdate() {
			this.$emit('updateColor', { h: this.h, s: this.s, l: this.l, a: this.a });
		}
	},
	watch: {
		h() {
			this.emitUpdate();
			this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
		},
		s() { this.emitUpdate() },
		l() { this.emitUpdate() },
		a() {
			this.emitUpdate();
			this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
		},
	},
	mounted() {
		this.sliderPointerWidth = this.$refs.huePointer.offsetWidth;
		const hueCanvas = this.$refs.hueCanvas;
		const alphaCanvas = this.$refs.alphaCanvas;
		this.hueCanvasRect = hueCanvas.getBoundingClientRect();
		this.alphaCanvasRect = alphaCanvas.getBoundingClientRect();
		this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
		this.alphaTranslateX = this.a * this.alphaCanvasRect.width;

		// fill hue canvas
		let ctx = hueCanvas.getContext('2d');
		let gradient = ctx.createLinearGradient(hueCanvas.width, 0, 0, 0);
		gradient.addColorStop(0, 'hsl(0,100%,50%)');
		gradient.addColorStop(.17, 'hsl(298.8, 100%, 50%)');
		gradient.addColorStop(.33, 'hsl(241.2, 100%, 50%)');
		gradient.addColorStop(.50, 'hsl(180, 100%, 50%)');
		gradient.addColorStop(.67, 'hsl(118.8, 100%, 50%)');
		gradient.addColorStop(.83, 'hsl(61.2,100%,50%)');
		gradient.addColorStop(1, 'hsl(360,100%,50%)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, hueCanvas.width, hueCanvas.height);

		//fill alpha canvas
		// ctx = alphaCanvas.getContext('2d');
		// gradient = ctx.createLinearGradient(alphaCanvas.width, 0, 0, 0);
		// gradient.addColorStop(0, this.color.toHexString());
		// gradient.addColorStop(1, this.color.clone().setAlpha(0).toHslString());
		// ctx.fillStyle = gradient;
		// ctx.fillRect(0, 0, alphaCanvas.width, alphaCanvas.height);

	}
}

</script>

<style scoped>
	.slider-area {
		width: 90%;
		margin: 10px auto;
		position: relative;
	}
	.slider {
		height: 6px;
		top: 50%;
		position: absolute;
		width: 100%;
		border-radius: 3px;
		overflow: hidden;
		transform: translateY(-50%);
	}
	.slider-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
	.slider-pointer, .saturation-pointer {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px #fbfbfb solid;
		box-shadow: 0 0 5px rgba(15,15,15,.3);
	}

</style>