<template>
	<iframe :src="ccUrl" class="cc" ref="iframeRef"></iframe>
</template>

<script setup>
	import { ref, computed } from "vue";
	import { isLogin, isApiLogin, config } from "@/components/API";
	import { useMessage } from "naive-ui";
	const $message = useMessage();
	const { data } = defineProps({
		data: Object,
	});
	const emit = defineEmits(["update:data", "router"]);
	const ccUrl = computed(() => {
		return `${config.wwwUrl}/loginInFlat?flat=${data.uid}&redirect=${
			data.redirect || "Home"
		}`;
	});
	const iframeRef = ref(null);
	// https://juejin.cn/post/6962901957895782413
	window.addEventListener(
		"message",
		(ev) => {
			console.warn(ev.data);
			if (ev.data.token) {
				$message.success("登陆成功");
				emit("update:data", ev.data);
				emit("router", { router: ev.data.path });
			}
		},
		false
	);
	const initPage = async () => {
		const isLogin = await isApiLogin();
		if (isLogin) {
			$message.success("已登录");
			emit("router", { router: data.redirect || "Home" });
		}
	};
	initPage();
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