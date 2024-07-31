<template>
	<div id="app">
		<div class="box-parent" v-if="appendToActive">
			HERE WILL BE THE BOX (ALWAYS <i>POSITION:RELATIVE</i>)
		</div>
		<h1>vue-color-input demo</h1>
		<h3>
			<a class="docsLink" href="https://github.com/gVguy/vue-color-input#vue-color-input"
			:style="{ color: linkColor }">Docs</a>
		</h3>
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
			<div class="setup-block">
				<h3>appendTo external div</h3>
				<input type="checkbox" class="chx" v-model="appendToActive" @pointerdown.stop>
			</div>
		</div>
		<color-input 
			:appendTo="appendToActive ? appendTo : null"
			v-model="color"
			:format="format + (type ? ' ' + type : '')"
			:position="position"
			:disable-alpha="disableAlpha"
			:disabled="disabled"
			:disable-text-inputs="disableTextInputs"
			@mounted="logEvent('mounted');"
			@beforeUnmount="logEvent('beforeUnmount');"
			@pickStart="logEvent('pickStart')"
			@pickEnd="logEvent('pickEnd')"
			@hueInputStart="logEvent('hueInputStart', $event)"
			@hueInputEnd="logEvent('hueInputEnd', $event)"
			@hueInput="logEvent('hueInput', $event)"
			@alphaInputStart="logEvent('alphaInputStart', $event)"
			@alphaInputEnd="logEvent('alphaInputEnd', $event)"
			@alphaInput="logEvent('alphaInput', $event)"
			@saturationInputStart="logEvent('saturationInputStart', $event)"
			@saturationInputEnd="logEvent('saturationInputEnd', $event)"
			@saturationInput="logEvent('saturationInput', $event)"
			@change="logEvent('change', $event)"
			ref="colorInput" 
		/>
		<div class="detailsSection">
			<div class="detailsBlock">
				<h2>Style it</h2>
				<div class="textarea-buttons">
					<button @click="resetDemoStyles">Reset</button>
					<button @click="clearDemoStyles">Clear</button>
				</div>
				<textarea
				@input="updateStyles"
				@keydown="textareaKeyHandler"
				ref="textarea"
				v-model="styles"
				spellcheck="false">
				</textarea>
			</div>
			<div class="detailsBlock">
				<h2>Event Log</h2>
				<div class="textarea-buttons right">
					<button @pointerdown.prevent.stop @click="log = ''">Clear</button>
					<button @pointerdown.prevent.stop @click="logEnabled = !logEnabled">{{ logEnabled ? 'Disable' : 'Enable' }}</button>
				</div>
				<div class="event-log-wrapper">
					<textarea ref="eventLog" class="event-log" readonly v-text="log"></textarea>
					<div :class="['log-overlay', { disabled: !logEnabled }]">
						<h2 v-if="!logEnabled">Log disabled</h2>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import ColorInput from '@/color-input.vue';

	import demoStyles from '!!raw-loader!./demo-styles.css';

	export default defineComponent({
		name: 'ServeDev',
		components: {
			ColorInput
		},
		data() {
			return {
				color: 'hsl(182, 41%, 75%)',
				linkColor: 'hsl(182, 41%, 52%)', // limited
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
				appendToActive: null,
				appendTo: '.box-parent',
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
							if (typeof v ==='number') color[k] = Number(v.toFixed(3));
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
			},
		},
		methods: {
			formatSelect(f) {
				this.format = (this.format === f) ? '' : f; 
			},
			typeSelect(t) {
				this.type = (this.type === t) ? '' : t; 
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
			clearDemoStyles() {
				this.styles = demoStyles.replace(/{[^{]*}/gm, '{}');
				this.updateStyles();
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

			// empty object for log records
			this.lastLog = {};
		},
		mounted() {
			// style node for demo styles
			this.styleSheet = document.createElement("style");
			this.styleSheet.type = "text/css";
			this.styleSheet.innerText = this.styles;
			document.head.appendChild(this.styleSheet);

			// textarea size
			this.resizeTextarea();
			// log initial size to match textarea
			this.$refs.eventLog.style.height = this.$refs.textarea.style.height;

			//add code spans instead of `` in description blocks
			document.querySelectorAll('.detailsBlock p').forEach(p => {
				let result = p.innerHTML.replace(/([^`]*`[^`]*)`/gm, '$1</span>').replace(/`/gm, '<span class="code">');
				p.innerHTML = result;
			});
		},
		watch: {
			appendToActive() {
				this.$refs.colorInput.pickEnd()
				setTimeout(() => {
					this.$refs.colorInput.getParent()
				}, 100)
			},
			color() {
				let hsl = this.$refs.colorInput.color.clone().setAlpha(1).toHslString();
				let [h,s,l] = hsl.match(/\d+/g);
				const limit = 60 - 0.2 * s; // (0 => 60), (100 => 40)
				l = Math.min(limit, l); // limit l to calculated limit
				this.linkColor = `hsl(${h}, ${s}%, ${l}%)`
			}
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
	}
	.event-log {
		overflow-y: auto;
		overflow-x: hidden;
		resize: none;
		text-align: right;
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
	.textarea-buttons {
		margin: 5px 0;
		&.right {
			text-align: right;
		}
	}
	.small {
		font-size: .8em;
	}
	button {
		margin-right: 5px;
	}
	.box-parent {
		position: relative;
	}
</style>