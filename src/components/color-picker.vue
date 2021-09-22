<template>
	<div>
		<div class="slider-area" @mousedown.prevent="huePickStart">
			<div class="slider">
				<canvas class="slider-canvas" ref="hueCanvas"></canvas>
			</div>
			<div class="slider-pointer" ref="huePointer" :style="huePointerStyles"></div>
		</div>
		<div class="slider-area" @mousedown.prevent="alphaPickStart">
			<div class="slider transparency-pattern">
				<div class="slider-canvas" ref="alphaCanvas" :style="alphaCanvasStyles"></div>
			</div>
			<div class="slider-pointer" ref="alphaPointer" :style="alphaPointerStyles">
				<div class="pointer-transparent" :style="alphaPointerTransparentStyles">
					<div class="pointer-color" :style="[ hexBackgroundColor, { opacity: a } ]"></div>
				</div>
			</div>
		</div>
		<div class="saturation-area">
			<canvas class="slider-canvas" ref="saturationCanvas"></canvas>
		</div>
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
			...this.color.toHsv(),
			hueTranslateX: 0,
			alphaTranslateX: 0,
			sliderPointerWidth: 0,
		}
	},
	computed: {
		huePointerStyles() {
			return {
				background: 'hsl(' + this.h + ', 100%, 50%)',
				transform: 'translateX(' + (this.hueTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		hexBackgroundColor() {
			return {
				background: this.color.toHexString(),
			}
		},
		alphaPointerStyles() {
			return {
				transform: 'translateX(' + (this.alphaTranslateX - this.sliderPointerWidth * .5) + 'px)'
			}
		},
		alphaPointerTransparentStyles() {
			return {
				backgroundPosition: -this.alphaTranslateX + 'px',
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
		getCanvasRects() {
			this.hueCanvasRect = this.$refs.hueCanvas.getBoundingClientRect();
			this.alphaCanvasRect = this.$refs.alphaCanvas.getBoundingClientRect();
			this.saturationCanvasRect = this.$refs.saturationCanvas.getBoundingClientRect();
		},
		emitUpdate() {
			this.$emit('updateColor', { h: this.h, s: this.s, v: this.v, a: this.a });
		}
	},
	watch: {
		h() {
			this.emitUpdate();
			this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
		},
		s() { this.emitUpdate() },
		v() { this.emitUpdate() },
		a() {
			this.emitUpdate();
			this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
		},
	},
	mounted() {
		console.log('color picker mounted');

		this.getCanvasRects();
		this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
		this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
		this.sliderPointerWidth = this.$refs.huePointer.offsetWidth;

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

		// window resize event listeners for updating canvas rects
		window.addEventListener('resize', this.getCanvasRects);
	},
	beforeUnmount() {
		console.log('color picker unmounting');
		window.removeEventListener('resize', this.getCanvasRects);
	}
}

</script>

<style scoped lang="scss">
	%fill-100 {
		width: 100%;
		height: 100%;
	}
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
		background-size: contain;
	}
	.slider-canvas {
		@extend %fill-100;
		display: block;
	}
	.slider-pointer {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #fbfbfb;
		overflow: hidden;
		border: 2px #fbfbfb solid;
		box-shadow: 0 0 5px rgba(15,15,15,.3);
	}
	.transparency-pattern {
		background-image: url('../assets/method-transparent-pattern.svg');
	}
	.pointer-color {
		@extend %fill-100;
	}
	.pointer-transparent {
		@extend %fill-100;
		@extend .transparency-pattern;
		background-size: auto 100%;
	}
	.saturation-area {
		
	}

</style>