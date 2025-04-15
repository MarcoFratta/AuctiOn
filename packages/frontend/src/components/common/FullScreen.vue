<script lang="ts" setup>
defineProps(['containerCls'])
</script>
<template>
  <div
    class="size-full overflow-x-hidden overflow-y-auto scrollbar-hide content-center items-center"
  >
    <div :class="containerCls" class="w-full h-fit flex flex-col justify-center items-center">
      <slot />
    </div>
  </div>
</template>
