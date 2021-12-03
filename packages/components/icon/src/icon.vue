<template>
  <i class="sl-icon" :style="style">
    <slot></slot>
  </i>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { iconProps } from "./icon"

import type { CSSProperties } from 'vue'

export default defineComponent({
  name: 'SLIcon',
  props: iconProps,
  setup(props) {
    const style = computed<CSSProperties>(() => {
      if (!props.size && !props.color) {
        return {}
      }
      return {
        fontSize: props.size? `${props.size}px` : '',
        color: props.color? props.color : ''
      }
    })

    return {
      style
    }
  }
})
</script>