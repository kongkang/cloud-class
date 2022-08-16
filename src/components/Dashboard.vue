<template>
    <n-space vertical>
        <h1>Dashboard: {{data.uid}}</h1>
		<n-button @click="emit('router', {router:'Home'})" type="warning"
			>切换页面(Home)</n-button
		>
		<n-button @click="emit('router', {router:'Screen'})" type="warning"
			>切换页面(Screen)</n-button
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