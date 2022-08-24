<template>
	<n-layout has-sider position="absolute" class="screen_all">
		<n-layout-sider class="screen_left">
			<h1>实操说明</h1>
			<div
				v-html="data.classObj.homework.content"
				v-if="data.classObj.homework"
			></div>
		</n-layout-sider>
		<n-layout class="screen_right">
			<n-layout-header class="screen_header">
				<n-space justify="end" align="center">
					<n-text>Playback: {{ data.uid }}</n-text>
                    <n-button @click="emit('router', { router: 'Dashboard' })" type="default"
                        >返回</n-button
                    >
				</n-space>
			</n-layout-header>
			<n-layout-content class="screen_content">
				<n-spin :show="!isStart">
					<template #description> 正在连接 </template>
					<iframe
						:src="ccUrl"
						class="cc"
						ref="screenRef"
						v-if="isStart"
						allow="clipboard-write; clipboard-read"
					></iframe>
				</n-spin>
			</n-layout-content>
		</n-layout>
	</n-layout>
</template>

<script setup>
	import { ref, computed, onBeforeUnmount } from "vue";
	import {
		NButton,
		NSpace,
		NLayout,
		NLayoutHeader,
		NLayoutContent,
		NLayoutFooter,
		NLayoutSider,
		NText,
		NSpin,
		useMessage,
	} from "naive-ui";
	import { api, config } from "@/components/API";

	const $message = useMessage();
	onBeforeUnmount(() => {
		emit("update:data", { practiceObj: {} });
	});

	const emit = defineEmits(["router", "update:data"]);
	const { data } = defineProps({
		data: Object,
	});
	const practiceId = ref("");
	const isStart = ref(false);
	const ccUrl = ref("");
	const screenRef = ref(null);
	// https://juejin.cn/post/6962901957895782413
	window.addEventListener(
		"message",
		(ev) => {
			if (ev.data.token) {
                alert('ha?');
			}
		},
		false
	);
	const loadData = () => {
        console.warn("loadData", data.classObj.id);
        if (data.practiceObj.id) {
			isStart.value = true;
			ccUrl.value = `${config.wwwUrl}/playback/${data.practiceObj.id}?flat=${data.uid}`;
            return $message.success("读取中");
        }
        $message.warning("请先选定一位学生的作业。");
        return emit("router", { router: "Dashboard" });
	};
	loadData();
	const screenFocusFn = () => {
		screenRef.value.focus();
		screenRef.value.classList.add("focus");
	};
	const screenBlurFn = () => {
		screenRef.value.blur();
		screenRef.value.classList.remove("focus");
	};
	const connectionFn = () => {
		api.practice
			.acquireConnect({ practiceId: practiceId.value })
			.then(console.warn);
	};
	const rebootFn = () => {
		return loadData();
	};
	const submitFn = () => {
		api.practice
			.submit({ practiceId: practiceId.value })
			.then(
				(res) => {
					console.warn("submit", res);
					if (res.code === 0) {
						$message.success("提交成功");
						emit("update:data", {
							practice: res.data,
						});
					} else {
						$message.error(res.msg);
					}
				}
			);
	};
</script>

<style lang="scss" scope>
.screen_left {
	width: 100px;
}
.screen_right {
	position: relative;
	.screen_header {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 40px;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
		.n-space {
			height: 100%;
			padding: 0 10px;
		}
	}
	.screen_content {
		height: calc(100% - 40px);
		background-color: rgba(0, 0, 0, 0.5);
		overflow: auto;
		margin-top: 40px;
		z-index: 0;
		.n-spin-container, iframe {
			width: 100%;
			height: 100%;
		}
	}
}
</style>