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
					<n-text>Screen: {{ data.uid }}</n-text>
					<n-space v-if="!data.isTeacher">
						<n-button @click="submitFn" type="primary">提交作业</n-button>
						<n-button @click="connectionFn" type="info" secondary
							>申请连线</n-button
						>
						<n-button @click="rebootFn" type="error" tertiary
							>重新连接</n-button
						>
					</n-space>
					<n-space v-else>
						<n-button @click="emit('router', { router: 'Home' })" type="default"
							>返回</n-button
						>
					</n-space>
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
						@mouseover="screenFocusFn()"
						@mouseout="screenBlurFn()"
					></iframe>
				</n-spin>
				<n-button
					type="warning"
					tag="a"
					:href="ccUrl"
					target="_blank"
					v-if="isStart && ccUrl"
				>
					外链监控
				</n-button>
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
	import { api } from "@/components/API";

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
				emit("update:data", ev.data);
				emit("router", ev.data.path || "Home");
			}
		},
		false
	);
	const loadData = () => {
		if (data.isTeacher) {
			console.warn("loadData", data.classObj.id);
			if (data.practiceObj.id) {
				return api.practice
					.agreeConnect({
						practiceId: data.practiceObj.id,
					})
					.then(
						(res) => {
							console.warn("agreeConnect", res);
							if (res && res.url) {
								isStart.value = true;
								practiceId.value = res.id;
								ccUrl.value = res.url;
								emit("update:data", {
									practice: res,
								});
							}
						},
						(err) => {
							console.error(err);
							if (err.code === 2002) {
								emit("router", { router: "Login", redirect: "Screen" });
								return;
							}
							$message.error(err.msg);
							emit("router", { router: "Home" });
						}
					);
			}
			$message.warning("请先选定一位学生的作业。");
			return emit("router", { router: "Dashboard" });
		} else {
			api.practice
				.join({
					cloudClassId: data.classObj.id,
				})
				.then(
					(res) => {
						console.warn("practice join", res);
						if (res && res.url) {
							isStart.value = true;
							practiceId.value = res.id;
							ccUrl.value = res.url;
						}
					},
					(err) => {
						console.error(err);
						if (err.code === 2002) {
							emit("router", { router: "Login", redirect: "Screen" });
							return;
						}
						$message.error(err.msg);
						emit("router", { router: "Home" });
					}
				);
		}
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
		api.practice.acquireConnect({ practiceId: practiceId.value }).then((res) => {
			emit("update:data", {
				connection: res.id,
			});
		});
	};
	const rebootFn = () => {
		return loadData();
	};
	const submitFn = () => {
		api.practice.submit({ practiceId: practiceId.value }).then(
			(res) => {
				console.warn("submit", res);
				if (res.code === 0) {
					$message.success("提交成功");
					emit("update:data", {
						practice: practiceId.value,
					});
					emit("router", { router: "Home" });
				} else {
					$message.error(res.msg);
				}
			},
			(err) => {
				$message.error(err.msg);
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
		.n-spin-container,
		iframe {
			width: 100%;
			height: 100%;
		}
	}
}
</style>