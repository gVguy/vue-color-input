<script setup lang="ts">
import ColorInput from '../src/color-input.vue'
import { ref } from 'vue'

const color = ref('#ccc')

const colorInput = ref<InstanceType<typeof ColorInput>>()

setTimeout(() => {
	colorInput.value.pickStart()
}, 2000)

setTimeout(() => {
	console.log(colorInput.value.active)
	console.log(colorInput.value.color.toRgb())
}, 4000)


</script>

<template>
	<ColorInput v-model="color" ref="colorInput" class="my-color-input" />
</template>

<style>
</style>

