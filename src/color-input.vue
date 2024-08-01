<template>
    <div
      :class="[$attrs.class, bem('box', { disabled, active })]"
      @click.stop="pickStart"
      ref="root"
    >
      <div
	:class="bem('box-inner', { active })"
	:style="transparentPatternBg"
      >
        <div :class="bem('box-color')" :style="boxColorStyles"></div>
      </div>
    </div>

    <Teleport to="body">
      <transition :name="transition">
        <color-picker
	  v-if="color"
	  :class="$attrs.class"
          :color="color"
          :position="processedPosition"
          :disable-alpha="processedDisableAlpha"
          :boxRect="boxRect"
          :disable-text-inputs="disableTextInputs"
          v-show="active"
          :style="{ visibility: hidePicker ? 'hidden' : '' }"
          @ready="hidePicker = false"
          @updateColor="emitUpdate"
          @hueInputStart="$emit('hueInputStart', $event)"
          @hueInputEnd="$emit('hueInputEnd', $event)"
          @hueInput="$emit('hueInput', $event)"
          @alphaInputStart="$emit('alphaInputStart', $event)"
          @alphaInputEnd="$emit('alphaInputEnd', $event)"
          @alphaInput="$emit('alphaInput', $event)"
          @saturationInputStart="$emit('saturationInputStart', $event)"
          @saturationInputEnd="$emit('saturationInputEnd', $event)"
          @saturationInput="$emit('saturationInput', $event)"
          @change="$emit('change', $event)"
          ref="picker"
        />
      </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { ColorInputWithoutInstance } from 'tinycolor2'
import tinycolor from "tinycolor2";
import { bem } from './bem'
import { allowedPosition, allowedFormat, Format, Position, FormatCategory, FormatType } from './types'
import transparentPattern from "./assets/transparent-pattern.svg";
import ColorPicker from "./components/color-picker.vue";


const isSameNodeRecursive = (elA: HTMLElement, elB: HTMLElement) => {
  while (!/^(body|html)$/i.test(elA.tagName)) {
    if (elA === elB) return true;
    elA = elA.parentNode as HTMLElement;
  }
  return false;
};



const props = withDefaults(defineProps<{
  format?: Format;
  position?: Position;
  transition?: string;
  disableAlpha?: boolean;
  disabled?: boolean;
  disableTextInputs?: boolean;
}>(), {
  format: 'rgb',
  position: 'bottom',
  transition: 'color-input__popup-',
});


const modelValue = defineModel<string|Record<string, number>>({ required: true })


const emit = defineEmits([
  'mounted',
  'beforeUnmount',
  'update:modelValue',
  'pickStart',
  'pickEnd',
  'hueInputStart',
  'hueInputEnd',
  'hueInput',
  'alphaInputStart',
  'alphaInputEnd',
  'alphaInput',
  'saturationInputStart',
  'saturationInputEnd',
  'saturationInput',
  'change',
])


const color = shallowRef<ReturnType<typeof tinycolor> | null>(null);
const active = ref(false);
const ready = ref(false);
const hidePicker = ref(false);
const boxRect = ref({} as DOMRect);
const originalFormatCategory = ref<FormatCategory>('rgb');
const originalFormatType = ref<FormatType>('string');

const output = ref<string|object|null>(null);
const root = ref<HTMLElement|null>(null);
const picker = ref<any>(null); // picker instance

const transparentPatternBg = computed(() => ({
  backgroundImage: `url(${transparentPattern})`,
}));

const boxColorStyles = computed(() => ({
  background: color.value?.toRgbString(),
}));

const processedPosition = computed(() => {
  let position = props.position.toLowerCase() as Position;
  if (!allowedPosition.includes(position)) {
    if (position) {
      console.warn('[vue-color-input]: invalid position -> ' + position);
    }
    position = 'bottom center';
  }
  const positionArr = position.split(' ') as ('top'|'right'|'bottom'|'left'|'center')[];
  positionArr[1] = positionArr[1] || 'center';

  if (
    ['top', 'bottom'].includes(positionArr[0]) ||
    ['right', 'left'].includes(positionArr[1])
  )
    return positionArr;
  positionArr.reverse();
  return positionArr;
});

const processedFormat = computed(() => {
  let propsFormat = props.format;
  let formatCategory: FormatCategory
  let force = false;
  if (propsFormat) {
    propsFormat = propsFormat.toLowerCase() as FormatCategory;
    if (!allowedFormat.includes(propsFormat)) {
      console.warn('[vue-color-input]: invalid format -> ' + propsFormat);
      formatCategory = originalFormatCategory.value;
    } else {
      force = true;
    }
  } else {
    formatCategory = originalFormatCategory.value;
  }

  const formatArr = propsFormat.split(' ');
  let type: FormatType;
  const idx = formatArr.findIndex((f) => ['string', 'object'].includes(f));
  if (idx < 0) {
    type = ['rgb', 'hsv', 'hsl'].includes(propsFormat[0]) ? originalFormatType.value : 'string';
  } else {
    type = formatArr.splice(idx, 1)[0] as FormatType;
  }
  formatCategory = formatArr[0] as FormatCategory;

  return { type, format: formatCategory, force };
});

const processedDisableAlpha = computed(() => {
  const format = processedFormat.value;
  if (format.force && ['hex', 'name'].includes(format.format)) {
    return true;
  } else {
    return props.disableAlpha;
  }
});

const pickStart = () => {
  if (active.value || props.disabled) return;
  getBoxRect();
  active.value = true;

  ready.value = false;
  hidePicker.value = true;
  picker.value.init();

  document.addEventListener('pointerdown', pickEnd);
  window.addEventListener('resize', getBoxRect);
  emit('pickStart');
};

const pickEnd = (e?: Event) => {
  if (
    !active.value ||
    (e && isSameNodeRecursive(e.target as HTMLElement, picker.value.$refs.pickerRoot))
  )
    return;
  document.removeEventListener('pointerdown', pickEnd);
  window.removeEventListener('resize', getBoxRect);
  active.value = false;
  emit('pickEnd');
};

const init = () => {
  color.value = tinycolor(modelValue.value as ColorInputWithoutInstance);

  let format = color.value.getFormat() as FormatCategory|undefined;
  originalFormatCategory.value = format ? format : 'rgb';
  let type = typeof modelValue.value;
  originalFormatType.value = ['string', 'object'].includes(type) ? type as FormatType : 'string';
  processedFormat.value;

  output.value = null;

  if (!color.value.isValid()) {
    console.warn('[vue-color-input]: invalid color -> ' + color.value.getOriginalInput());
  }
};

const emitUpdate = (hsv?: {h:number;s:number;v:number;a?:number}) => {
  if (hsv) color.value = tinycolor(hsv);

  let format = processedFormat.value.format;
  if (color.value!.getAlpha() < 1 && ['hex', 'name'].includes(format)) {
    if (processedFormat.value.force) {
      color.value!.setAlpha(1);
    } else {
      format = 'rgb';
    }
  }
  if (processedFormat.value.type === 'object') {
    output.value = color.value?.[
      'to' + format.charAt(0).toUpperCase() + format.slice(1) as 'toRgb'
    ]() || null;
  } else {
    output.value = color.value!.toString(processedFormat.value.format);
  }
  emit('update:modelValue', output.value);
};

const getBoxRect = () => {
  boxRect.value = root.value!.getBoundingClientRect();
};


onMounted(() => {
  init();
  emit('mounted');
});

onBeforeUnmount(() => {
  pickEnd();
  emit('beforeUnmount');
});

watch(
  () => modelValue.value,
  () => {
    let input =
      typeof modelValue.value === 'object'
        ? JSON.stringify(modelValue.value)
        : modelValue.value;
    let outputStr =
      typeof output.value === 'object'
        ? JSON.stringify(output.value)
        : output.value;
    if (input !== outputStr) {
      init();
      if (active.value) {
        nextTick(() => {
          picker.value.init();
        });
      }
    }
  }
);

watch(
  () => props.disabled,
  () => {
    pickEnd();
  }
);

watch(
  () => processedDisableAlpha.value,
  (newVal) => {
    if (newVal) {
      color.value!.setAlpha(1);
      emitUpdate();
    }
    if (active.value)
      nextTick(() => {
        picker.value.init();
      });
  }
);

watch(
  () => props.format,
  () => {
    emitUpdate();
  }
);


defineExpose({
  pickStart,
  pickEnd,
  color,
  active
})

</script>

<style lang="scss">
%fill-100 {
  width: 100%;
  height: 100%;
}
.color-input {
  position: relative;
  display: inline-block;

  &__box {
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 20%;
    overflow: hidden;
    transition: background-color 0.05s 0.15s;
    &-inner {
      border-radius: inherit;
      overflow: hidden;
      transition: transform .2s;
      @extend %fill-100;
      background-color: #fff;
      background-size: 100%;
      &--active {
        transform: scale(0.9);
      }
    }
    &-color {
      @extend %fill-100;
    }
    &--active {
      background: #fbfbfb;
      transition: all 0.2s, background-color 0.05s;
    }
    &--disabled {
      cursor: not-allowed;
    }
  }
}

</style>
