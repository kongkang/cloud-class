<template>
    <n-space vertical>
        <h1>Dashboard: {{data.uid}}</h1>
		<n-button @click="emit('router', {router:'Home'})" type="warning"
			>返回（Home）</n-button
		>
    </n-space>
</template>

<script setup>
    import {NButton, NSpace} from "naive-ui";
    const emit = defineEmits(['router', 'update:data']);
	const { data } = defineProps({
		data: Object,
	});
</script>

<style lang="scss">
    
</style>