<template>
	<n-layout has-sider position="absolute" class="screen_all">
		<n-layout-sider class="screen_left">
			<h1>实操说明</h1>
			<div v-html="data.classObj.homework.content"></div>
		</n-layout-sider>
		<n-layout class="screen_right">
			<n-layout-header class="screen_header">
				<n-space justify="end" align="center">
					<n-text>Screen: {{ data.uid }}</n-text>
					<n-button
						@click="emit('router', { router: 'Dashboard' })"
						type="warning"
						class="submitFn"
						v-if="!data.isTeacher"
						>提交作业</n-button
					>
					<n-button
						@click="emit('router', { router: 'Home' })"
						type="default"
						v-else
						>返回</n-button
					>
				</n-space>
			</n-layout-header>
			<n-layout-content class="screen_content">
				<iframe :src="ccUrl" class="cc" ref="iframeRef" v-if="isStart"></iframe>
				<n-button v-else @click="loadData" type="success">开始实操</n-button>
			</n-layout-content>
			<n-layout-footer>
				<n-space>
					<n-button
						@click="emit('router', { router: 'Dashboard' })"
						type="warning"
						class="submitFn"
						v-if="!data.isTeacher"
						>提交作业</n-button
					>
					<n-button
						@click="emit('router', { router: 'Home' })"
						type="default"
						v-else
						>返回</n-button
					>
				</n-space>
			</n-layout-footer>
		</n-layout>
	</n-layout>
</template>

<script setup>
	import { ref, computed } from "vue";
	import {
		NButton,
		NSpace,
		NLayout,
		NLayoutHeader,
		NLayoutContent,
		NLayoutFooter,
		NLayoutSider,
		NText,
	} from "naive-ui";
	import { api } from "@/components/API";

	const emit = defineEmits(["router", "update:data"]);
	const { data } = defineProps({
		data: Object,
	});
	const isStart = ref(false);
	const ccUrl = ref("");
	const iframeRef = ref(null);
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
			return console.warn("你是老师，暂时没");
		}
		console.warn("loadData", data.classObj.id);
		api.practice
			.join({
				cloudClassId: data.classObj.id,
			})
			.then(
				(res) => {
					console.warn("practice", res);
				},
				(err) => {
					console.error(err);
					if (err.code === 2002){
						emit("router", { router: "Login", redirect: "Screen" });
					}
				}
			);
	};
	loadData();
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
		background-color: rgba(255, 0, 0, 0.5);
		overflow: auto;
		margin-top: 40px;
		z-index: 0;
		iframe {
			width: 100%;
			height: 100%;
		}
	}
}
</style>