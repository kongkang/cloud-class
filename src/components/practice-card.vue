<template>
	<n-card v-if="practice">
		<template #cover>
			<n-image
				src="https://picsum.photos/id/1/100/100"
				height="200"
				object-fit="cover"
				:preview-disabled="true"
				style="width: 100%; height: 100%"
			/>
		</template>
		<n-space vertical>
			<n-text>UID:{{ practice.userId }}</n-text>
			<n-text>CCID:{{ practice.cloudClassId }}</n-text>
			<n-text>状态：{{ practice.status }}</n-text>
		</n-space>
		<template #action>
			<n-space>
				<template v-if="isTeacher">
					<n-button type="info" @click="watchFn" v-if="practice.status == 0">
						观察
					</n-button>
					<n-button type="primary" @click="commentFn">
						评价
					</n-button>
					<n-button type="primary" @click="playbackFn" v-if="practice.status == 1">
						看回放
					</n-button>
				</template>
				<n-text v-if="practice.status == 2">
					批语：{{ practice.comment }}
				</n-text>
				<n-text v-else>
					<n-tag>等待反馈</n-tag>
				</n-text>
			</n-space>
		</template>
	</n-card>
</template>

<script setup>
	import { computed, h, ref } from "vue";
	import {
		NCard,
		NImage,
		NButton,
		NSpace,
		NText,
		NTag,
		useDialog,
		useMessage,
		NInput,
	} from "naive-ui";
	import { isLogin, api } from "@/components/API";

	const $dialog = useDialog();
	const $message = useMessage();
	const props = defineProps(["data", "isTeacher"]);
	const $emit = defineEmits(["update:data", "router"]);
	const practice = computed(() => {
		return props.data;
	});
	console.log(practice);

	const watchFn = () => {
		console.log(practice.value);
		$emit("update:data", {
			practiceObj: practice.value,
		});
		$emit("router", {
			router: "Playback",
		});
	};
	const playbackFn = () => {
		$emit("update:data", {
			practiceObj: practice.value,
		});
		$emit("router", {
			router: "Playback",
		});
	};
	const comment = ref("");
	const commentFn = () => {
		$dialog.info({
			title: "填写评语",
			content: () => {
				return h(NInput, {
					value: comment.value,
					placeholder: "请输入作业评语，学生会收到通知。",
					onInput: (e) => {
						comment.value = e;
					},
				});
			},
			positiveText: "确定",
			onPositiveClick() {
				api.practice.comment({practiceId: practice.value.id, comment: comment.value}).then((res)=>{
					$emit("update:data", {
						"practice": practice.value.id
					});
				})
			},
			negativeText: "取消",
		});
	};
</script>

<style lang="scss">
</style>