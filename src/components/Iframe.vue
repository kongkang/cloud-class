<template>
	<iframe
		:src="ccUrl"
		class="cc"
		ref="iframeRef"
	></iframe>
</template>

<script setup>
	import { ref, computed } from "vue";
	const { data } = defineProps({
		data: Object,
	});
    const emit = defineEmits(["update:data", "router"]);
    const ccUrl = computed(() => {
        return 'https://local.cloudos.com:3000/loginInFlat?flat=' + data.uid + '&redirect=' + data.redirect;
    });
	const iframeRef = ref(null);
    // https://juejin.cn/post/6962901957895782413
	window.addEventListener(
		"message",
		(ev) => {
			if (ev.data.token){
                emit("update:data", ev.data);
                emit("router", ev.data.path || "Home");
            }
		},
		false
	);
</script>

<style lang="scss">
.cc {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	border: none;
}
</style>