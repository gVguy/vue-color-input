<template>
	<div id="app">
		<h1>vue-color-input demo</h1>
		<h3><a class="docsLink" href="https://github.com/gVguy/vue-color-input#vue-color-input">Docs</a></h3>
		<div class="setup">
			<div class="setup-block main">
				<h3>v-model</h3>
				<input class="color-text" v-model="colorString" spellcheck="false">
				<div>
					<span v-for="f in formatOptions"
					:class="['setup-radio-button', { active: (format === f) }]"
					@click="formatSelect(f)"
					@pointerdown.stop>{{f}}</span>
				</div>
				<div>
					<span v-for="(state, t) in typeOptions"
					:class="['setup-radio-button', { active: (type === t), disabled: !state }]"
					@click="state ? typeSelect(t) : null"
					@pointerdown.stop>{{t}}</span>
				</div>
			</div>
			<div class="setup-block">
				<h3>position</h3>
				<select v-model="position">
					<option v-for="opt in positionOptions" :value="opt">{{opt}}</option>
				</select>
			</div>
			<div class="setup-block">
				<h3>disabled</h3>
				<input type="checkbox" class="chx" v-model="disabled" @pointerdown.stop>
			</div>
			<div class="setup-block">
				<h3>disable-alpha</h3>
				<input v-if="!hexNameSelected" type="checkbox" class="chx" v-model="disableAlpha" @pointerdown.stop>
				<input v-else type="checkbox" class="chx disabled" checked disabled @pointerdown.stop>
			</div>
			<div class="setup-block">
				<h3>disable-text-inputs</h3>
				<input type="checkbox" class="chx" v-model="disableTextInputs" @pointerdown.stop>
			</div>
		</div>
		<color-input v-model="color"
		:format="format + (type ? ' ' + type : '')"
		:position="position"
		:disable-alpha="disableAlpha"
		:disabled="disabled"
		:disable-text-inputs="disableTextInputs"
		@hook:mounted="mountedHandler"
		@hook:beforeUnmount="beforeUnmountHandler"
		@pickStart="pickStartHandler"
		@pickEnd="pickEndHandler"
		@hueInputStart="logEvent('hueInputStart', $event)"
		@hueInputEnd="logEvent('hueInputEnd', $event)"
		@hueInput="logEvent('hueInput', $event)"
		@alphaInputStart="logEvent('alphaInputStart', $event)"
		@alphaInputEnd="logEvent('alphaInputEnd', $event)"
		@alphaInput="logEvent('alphaInput', $event)"
		@saturationInputStart="logEvent('saturationInputStart', $event)"
		@saturationInputEnd="logEvent('saturationInputEnd', $event)"
		@saturationInput="logEvent('saturationInput', $event)"
		ref="colorInput" />
		<div class="detailsSection">
			<div class="detailsBlock">
				<h2>Style it</h2>
				<textarea
				@focus="textareaFocusHandler"
				@pointerdown.stop
				@input="updateStyles"
				@keydown="textareaKeyHandler"
				ref="textarea"
				v-model="styles"
				spellcheck="false">
				</textarea>
				<button
				@pointerdown.prevent.stop
				@click="resetDemoStyles"
				style="display:block">Reset</button>
				<p>
					By default the component renders a 40x40 square inline-block.<br>
					Root element has class `.color-input`,<br>
					The 'input' box has class `.box`,<br>
					Once clicked on, it gets an `.active` class,<br>
					If `disabled` property is set to `true`, it gets a `.disabled` class,<br>
					Color picker popup has class `.picker-popup`.
				</p>
				<p>
					You can override default styles by using `.color-input ` in the selector.
				</p>
			</div>
			<div class="detailsBlock">
				<h2>Event Log</h2>
				<div class="event-log-wrapper">
					<textarea ref="eventLog" class="event-log" readonly v-text="log"></textarea>
					<div :class="['log-overlay', { disabled: !logEnabled }]">
						<h2 v-if="!logEnabled">Log disabled</h2>
					</div>
				</div>
				<div class="log-buttons">
					<button @pointerdown.prevent.stop @click="log = ''">Clear</button>
					<button @pointerdown.prevent.stop @click="logEnabled = !logEnabled">{{ logEnabled ? 'Disable' : 'Enable' }}</button>
				</div>
				<p class="small">NB: for perfomance purposes, this log is limited to recording events of the <i>same type</i> not more often than once in 100ms</p>
				<p>
					Vue-color-input instance emits events on every interaction.<br>
					When color pick procces is initiated (color box is clicked and the popup comes on) `pickStart` event is fired,<br>
					And the other way around, when popup is closed the instance emits `pickEnd`.<br>
					These two events don't carry any payload.
				</p>
				<p>
					All other events can be categorized in three groups by color components they're associated with.<br>
					These are:<br>
					- hue events: (`hueInputStart` | `hueInput` | `hueInputEnd`)<br>
					- alpha events: (`alphaInputStart` | `alphaInput` | `alphaInputEnd`)<br>
					- saturation events: (`saturationInputStart` | `saturationInput` | `saturationInputEnd`)
				</p>
				<p>
					All these provide current state of their respective color components.
				</p>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorInput from '@/color-input.vue';

	const demoStyles = `.color-input {
	margin-bottom: 180px;
}
.color-input .box {
	width: 100px;
	height: 100px;
	border-radius: 50px;
}
.color-input .box.active {
	border-color: #0f0f0f;
}
.color-input .box.disabled {}
.color-input .picker-popup {}
.color-input .slider {}
.color-input .slider-pointer {}
.color-input .saturation-pointer {}`;

	export default defineComponent({
		name: 'ServeDev',
		components: {
			ColorInput
		},
		data() {
			return {
				color: 'pink',
				styles: demoStyles,
				position: 'bottom',
				disableAlpha: false,
				disabled: false,
				disableTextInputs: false,
				log: '',
				logEnabled: true,
				format: '',
				type: '',
				formatOptions: ['rgb', 'hex', 'hex8', 'name', 'hsl', 'hsv'],
			}
		},
		computed: {
			logStyles() {
				return {
					opacity: this.logEnabled ? 1 : .3
				}
			},
			hexNameSelected() {
				return ['hex','name'].includes(this.format);
			},
			typeOptions() {
				const options = { string: false, object: false };
				if (this.format) {
					if (['rgb','hsl','hsv'].includes(this.format)) {
						options.object = true;
					} else if (this.type === 'object') {
						this.type = '';
					}
					options.string = true;
				}
				return options;
			},
			colorString: {
				get() {
					let color = this.color;
					if (typeof color === 'object') {
						color = JSON.parse(JSON.stringify(color));
						for (let [k,v] of Object.entries(color)) {
							color[k] = Number(v.toFixed(3));
						}
						color = JSON.stringify(color)
					}
					return color;
				},
				set(v) {
					if (/{.*}/.test(v.trim())) {
						v = v.replace(/'/g,'"');
						v = v.replace(/([{,])\s?(\w*)(:)/g, '$1"$2"$3'); // add quotes for parse
						try {
							v = JSON.parse(v);
						} catch(e) {}
					}
					this.color = v;
				}
			}
		},
		methods: {
			formatSelect(f) {
				this.format = (this.format === f) ? '' : f; 
			},
			typeSelect(t) {
				this.type = (this.type === t) ? '' : t; 
			},
			textareaFocusHandler() {
				this.$refs.colorInput.pickStart();
			},
			textareaKeyHandler(e) {
				const textarea = e.target;
				switch (e.key) {
					case 'Tab': {
						e.preventDefault();
						textarea.setRangeText('\t', textarea.selectionStart, textarea.selectionEnd, 'end');
						break;
					}
					case 'Enter': {
						const textBeforeInsertion = textarea.value.slice(0,textarea.selectionStart);
						const symbolBeforeInsertion = textBeforeInsertion.slice(-1);
						const symbolAfterInsertion = textarea.value.charAt(textarea.selectionEnd);
						if (symbolBeforeInsertion === '{' && symbolAfterInsertion === '}') {
							const finalPosition = textarea.selectionStart + 2;
							textarea.setRangeText('\n\t\n', textarea.selectionStart, textarea.selectionEnd, 'end');
							textarea.selectionStart = finalPosition;
							textarea.selectionEnd = finalPosition;
							e.preventDefault();
						}
						else if (textBeforeInsertion.split('{').length > textBeforeInsertion.split('}').length) {
							e.preventDefault();
							textarea.setRangeText('\n\t', textarea.selectionStart, textarea.selectionEnd, 'end');
						}
						break;
					}
					case '}': {
						const textBeforeInsertion = textarea.value.slice(0,textarea.selectionStart);
						const lineStartPosition = textBeforeInsertion.lastIndexOf('\n');
						const thisLine = textBeforeInsertion.slice(lineStartPosition);
						if (!thisLine.trim().length) textarea.setRangeText('', lineStartPosition + 1, textarea.selectionEnd, 'end');
						break;
					}
				}
			},
			resizeTextarea() {
				this.$refs.textarea.style.height = this.$refs.textarea.scrollHeight + 3 + 'px';
			},
			updateStyles() {
				this.styleSheet.innerText = this.styles;
				// this.$refs.colorInput.getBoxRect();
			},
			logEvent(eventName, value='') {
				if (!this.logEnabled) return;
				const now = Date.now();
				if (this.lastLog[eventName] && now - this.lastLog[eventName] < 100) return;
				this.$refs.eventLog.scrollTop = 0;
				this.lastLog[eventName] = now;

				if (typeof value === 'object') value = JSON.stringify(value);
				this.log = eventName + ' ' + value + '\n' + this.log;
			},
			resetDemoStyles() {
				this.styles = demoStyles;
				this.updateStyles();
			},
			mountedHandler() {
				// observe box size changes
				if (!this.boxObserver) this.boxObserver = new ResizeObserver(this.$refs.colorInput.getBoxRect);
				this.boxObserver.observe(this.$refs.colorInput.$refs.boxRoot);
			},
			beforeUnmountHandler() {
				this.boxObserver.disconnect();
			},
			pickStartHandler() {
				setTimeout(() => {
					this.pickerObserver = new ResizeObserver(this.$refs.colorInput.$refs.picker.init);
					this.pickerObserver.observe(this.$refs.colorInput.$refs.picker.$refs.pickerRoot);
				},0);
				this.logEvent('pickStart', '');
			},
			pickEndHandler() {
				this.pickerObserver.disconnect();
				this.logEvent('pickEnd', '');
			}
		},
		created() {
			//create options for position dropdown
			const values = ['top','right','bottom','left'];
			const conflicts = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }
			this.positionOptions = values.flatMap((v, i) => values.map(q => {
				if (conflicts[v] === q) return false;
				return v === q ? v : v + ' ' + q;
			})).filter(v => v);
		},
		mounted() {
			// empty object for log records
			this.lastLog = {};

			// style node for demo styles
			this.styleSheet = document.createElement("style");
			this.styleSheet.type = "text/css";
			this.styleSheet.innerText = this.styles;
			document.head.appendChild(this.styleSheet);

			// textarea size
			this.resizeTextarea();

			//add code spans instead of `` in description blocks
			document.querySelectorAll('.detailsBlock p').forEach(p => {
				let result = p.innerHTML.replace(/([^`]*`[^`]*)`/gm, '$1</span>').replace(/`/gm, '<span class="code">');
				p.innerHTML = result;
			});
		},
		beforeUnmount() {
		}
	});
</script>

<style lang="scss">
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
	h1 {
		margin-bottom: 0;
	}
	.docsLink {
		margin-bottom: 20px;
		text-decoration: underline;
	}
	.setup {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.setup-block {
		flex: 0 1;
		margin: 10px;
		text-align: center;
		&.main {
			flex-basis: 100%;
			& .color-text {
				width: 380px;
				height: 40px;
			}
		}
	}
	.setup-block h3 {
		margin: 0;
		white-space: nowrap;
	}
	.setup-radio-button {
		font-size: .8em;
		border-radius: 5px;
		padding: 1px 4px;
		margin: 2px;
		background: #ddd;
		cursor: pointer;
		&:not(.disabled):hover {
			background: #ccc;
		}
		&.active {
			background: #aaa;
		}
		&.disabled {
			color: #777;
			cursor: default;
		}
	}
	input.color-text, select {
		font-family: inherit;
		font-size: 20px;
		outline: none;
		border-width: 0 0 1px 0;
		border-color: #0f0f0f;
		padding: 2px;
		background: inherit;
		box-sizing: border-box;
	}
	select {
		background-image: none;
		border-radius: 0;
		width: 230px;
		height: 30px;
	}
	input.chx {
		width: 30px;
		height: 30px;
		&.disabled {
			cursor: not-allowed;
		}
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
		min-width: 350px;
		flex: 1 1;
	}
	.detailsBlock h2 {
		text-align: center;
	}
	textarea {
		tab-size: 3;
		width: 100%;
		max-width: 100%;
		padding: 10px;
		border-radius: 3px;
		font-size: 16px;
		box-sizing: border-box;
	}
	textarea, .code {
		font-family: 'Source Code Pro', monospace;
		background-color: #efefef;
	}
	.event-log-wrapper {
		position: relative;
		height: 95px;
	}
	.event-log {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		resize: none;
	}
	.log-overlay {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		&.disabled {
			background: rgba(250,250,250,.8)
		}
	}
	.log-buttons {
		margin-top: 5px;
	}
	.small {
		font-size: .8em;
	}
	button {
		margin-right: 5px;
	}
</style>