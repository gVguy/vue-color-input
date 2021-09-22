<template>
	<div id="app">
		<h1>vue-color-input demo</h1>
		<input v-model="color" spellcheck="false">
		<color-input v-model="color"
		ref="colorInput"
		@pickStart="logEvent('pickStart')"
		@pickEnd="logEvent('pickEnd')"
		@huePickStart="logEvent('huePickStart ' + $event)"
		@huePickEnd="logEvent('huePickEnd ' + $event)"
		@alphaPickStart="logEvent('alphaPickStart ' + $event)"
		@alphaPickEnd="logEvent('alphaPickEnd ' + $event)" />
		<div class="detailsSection">
			<div class="detailsBlock">
				<h2>Style it</h2>
				<textarea
				@focus="textareaFocusHandler"
				@mousedown.stop
				@input="updateStyles"
				@keydown.tab.prevent="textareaTabHandler"
				v-model="styles"
				spellcheck="false">
				</textarea>
				<button
				@mousedown.prevent
				@click="resetDemoStyles"
				@mousedown.stop
				style="display:block">Reset</button>
				<p>
					By default the component renders a 40x40 square inline-block.<br>
					The 'input' itself has class <span class="code">.color-input-box</span>,<br>
					Once clicked on, it gets an <span class="code">.active</span> class,<br>
					Color picker popup has class <span class="code">.color-input-picker</span>
				</p>
				<p>
					You can take control of their styles by adding <span class="code">.user</span> class to the selector.
				</p>
			</div>
			<div class="detailsBlock">
				<h2>Event Log</h2>
				<div ref="eventLog" class="event-log">
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorInput from '@/color-input.vue';

	const demoStyles = `.color-input-box.user {
  width: 100px;
  height: 100px;
  border-radius: 50px;
}
.color-input-box.user.active {
  border-color: #0f0f0f;
}
.color-input-picker.user {
  top: -20px;
  left: 115%;
  width: 250px;
}`;

	export default defineComponent({
		name: 'ServeDev',
		components: {
			ColorInput
		},
		data() {
			return {
				color: 'pink',
				styles: demoStyles,
			}
		},
		methods: {
			textareaFocusHandler() {
				if (this.$refs.colorInput.active) return;
				this.$refs.colorInput.$refs.colorInputBox.click();
			},
			textareaTabHandler(e) {
				const textarea = e.target;
				const start = textarea.selectionStart;
				textarea.setRangeText('  ', start, start, 'end');
			},
			updateStyles() {
				this.styleSheet.innerText = this.styles;
			},
			logEvent(e) {
				this.$refs.eventLog.innerHTML = e + '<br>' + this.$refs.eventLog.innerHTML;
			},
			resetDemoStyles() {
				this.styles = demoStyles;
				this.updateStyles();
			}
		},
		mounted() {
			this.styleSheet = document.createElement("style");
			this.styleSheet.type = "text/css";
			this.styleSheet.innerText = this.styles;
			document.head.appendChild(this.styleSheet);
		}
	});
</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300&display=swap');
	body {
		background: #fbfbfb;
	}
	#app {
		font-family: 'Montserrat', sans-serif;
		font-size: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		width: 100%;
	}
	input {
		font-family: inherit;
		font-size: 20px;
		margin-bottom: 20px;
		outline: none;
		border-width: 0 0 1px 0;
		padding: 2px;
		background: inherit;
		width: 230px;
	}
	.detailsSection {
		display: flex;
		flex-wrap: wrap;
		flex-basis: 50%;
		width: 100%;
	}
	.detailsBlock {
		padding: 20px;
		text-align: left;
		position: relative;
		min-width: 250px;
		flex: 1 1;
	}
	.detailsBlock h2 {
		text-align: center;
	}
	textarea {
		width: 100%;
		max-width: 100%;
		padding: 10px;
		height: 310px;
		border-radius: 3px;
		font-size: 16px;
		box-sizing: border-box;
	}
	textarea, .code {
		font-family: 'Source Code Pro', monospace;
		background-color: #efefef;
	}
	.event-log {
		height: 95px;
		overflow: auto;
	}
</style>