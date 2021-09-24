<template>
	<div ref="pickerRoot" :style="pickerPosition">
		<div class="saturation-area" :style="pureHueBackground" @mousedown.prevent="saturationPickStart">
			<canvas class="slider-canvas" ref="saturationCanvas"></canvas>
			<div class="saturation-pointer" ref="saturationPointer" :style="[saturationPointerStyles, hexBackground]"></div>
		</div>
		<div class="slider-area" @mousedown.prevent="huePickStart">
			<div class="slider">
				<canvas class="slider-canvas" ref="hueCanvas"></canvas>
			</div>
			<div class="slider-pointer" ref="huePointer" :style="[ huePointerStyles, pureHueBackground ]"></div>
		</div>
		<div class="slider-area" @mousedown.prevent="alphaPickStart">
			<div class="slider transparency-pattern">
				<div class="slider-canvas" ref="alphaCanvas" :style="alphaCanvasStyles"></div>
			</div>
			<div class="slider-pointer" ref="alphaPointer" :style="alphaPointerStyles">
				<div class="pointer-transparent" :style="alphaPointerTransparentStyles">
					<div class="pointer-color" :style="[alphaPointerColorStyles, hexBackground]"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	name: 'ColorPicker',
	props: ['color', 'position', 'boxSize'],
	emits: [
		'updateColor',
		'huePickStart',
		'huePickEnd',
		'alphaPickStart',
		'alphaPickEnd',
		'saturationPickStart',
		'saturationPickEnd',
	],
	data() {
		return {
			...this.color.toHsv(),
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
			pickerHeight: 0
		}
	},
	computed: {
		pureHueBackground() {
			return {
				background: 'hsl(' + this.h + ', 100%, 50%)'
			}
		},
		hexBackground() {
			return {
				background: this.color.toHexString()
			}
		},
		huePointerStyles() {
			return {
				transform: 'translateX(' + (this.hueTranslateX - this.sliderPointerWidth * .5) + 'px)'
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
		pickerPosition() {
			const pickerPosition = {};
			const invertMap = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

			let offset;

			if (['top','bottom'].includes(this.position[0])) {
				pickerPosition.marginLeft = 0;
				pickerPosition.marginRight = 0;
				offset = this.boxSize.height;
			} else {
				pickerPosition.marginTop = 0;
				pickerPosition.marginBottom = 0;
				offset = this.boxSize.width;
			}
			let anchor = invertMap[this.position[0]];
			pickerPosition[anchor] = offset + 'px';

			if (this.position[1] === 'center') {
				// second position argument is 'center'
				if (['left','right'].includes(anchor)) {
					// centering on x-aixs
					anchor = 'top';
					offset = this.pickerHeight - this.boxSize.height;
				} else {
					// centering on y-aixs
					anchor = 'left';
					offset = this.pickerWidth - this.boxSize.width;
				}
				offset *= 0.5;
			} else {
				anchor = this.position[1];
				offset = 0;
			}
			pickerPosition[anchor] = -offset + 'px';

			return pickerPosition;
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
				this.h = Number(((e.pageX - this.hueCanvasRect.x) * 360 / this.hueCanvasRect.width).toFixed(3));
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
				this.a = Number(((e.pageX - this.alphaCanvasRect.x) / this.alphaCanvasRect.width).toFixed(3));
			} else if (e.pageX < this.alphaCanvasRect.x) this.a = 0;
			else this.a = 1;
		},
		saturationPickStart(e) {
			document.addEventListener('mouseup', this.saturationPickEnd);
			document.addEventListener('mousemove', this.saturationPickMove);
			this.saturationPickMove(e);
			this.$emit('saturationPickStart', { s: this.s, v: this.v });
		},
		saturationPickEnd(e) {
			document.removeEventListener('mouseup', this.saturationPickEnd);
			document.removeEventListener('mousemove', this.saturationPickMove);
			this.$emit('saturationPickEnd', { s: this.s, v: this.v });
		},
		saturationPickMove(e) {
			if (e.pageX >= this.saturationCanvasRect.x && e.pageX <= this.saturationCanvasRect.right) {
				this.s = Number(((e.pageX - this.saturationCanvasRect.x) / this.saturationCanvasRect.width).toFixed(3));
			} else if (e.pageX < this.saturationCanvasRect.x) this.s = 0;
			else this.s = 1;
			if (e.pageY >= this.saturationCanvasRect.y && e.pageY <= this.saturationCanvasRect.bottom) {
				this.v = Number((1 - ((e.pageY - this.saturationCanvasRect.y) / this.saturationCanvasRect.height)).toFixed(3));
			} else if (e.pageY < this.saturationCanvasRect.y) this.v = 1;
			else this.v = 0;
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
		s() {
			this.emitUpdate();
			this.saturationTranslateX = this.s * this.saturationCanvasRect.width;
		},
		v() {
			this.emitUpdate();
			this.saturationTranslateY = -this.v * this.saturationCanvasRect.height;
		},
		a() {
			this.emitUpdate();
			this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
		},
	},
	mounted() {
		console.log('color picker mounted');

		// picker size
		const { width, height } = this.$refs.pickerRoot.getBoundingClientRect();
		this.pickerHeight = height;
		this.pickerWidth = width;
		console.log(height, width);

		// get canvas rects and set initial values
		this.getCanvasRects();
		this.hueTranslateX = this.h * this.hueCanvasRect.width / 360;
		this.alphaTranslateX = this.a * this.alphaCanvasRect.width;
		this.saturationTranslateX = this.s * this.saturationCanvasRect.width;
		this.saturationTranslateY = -this.v * this.saturationCanvasRect.height;
		this.sliderPointerWidth = this.$refs.huePointer.offsetWidth;
		this.saturationPointerWidth = this.$refs.saturationPointer.offsetWidth;
		this.saturationPointerHeight = this.$refs.saturationPointer.offsetHeight;

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
		width: 85%;
		margin: 10px auto;
		position: relative;
	}
	.slider {
		display: block;
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
		width: 100%;
		height: 125px;
		position: relative;
	}
	.saturation-pointer {
		@extend .slider-pointer;
		width: 20px;
		height: 20px;
		position: absolute;
		bottom: 0;
		left: 0;
	}

</style>