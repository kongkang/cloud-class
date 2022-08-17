<template>
	<n-space vertical class="testWrap">
		<template v-if="data.isTeacher">
			<h1>云教室：课前准备</h1>
			<n-alert :type="classStatusArr[data.classObj.status] && classStatusArr[data.classObj.status].type || 'warning'" title="当前状态">
				{{classStatusArr[data.classObj.status] && classStatusArr[data.classObj.status].msg || '等待选择实操课'}}
			</n-alert>
			<n-space align="center">
				<n-text type="default">课前准备：</n-text>
				<n-button @click="emit('update:data', {classObj: {status: 1}})" type="primary">开始</n-button>
				<n-cascader
					:value="data.classObj"
					:placeholder="'请选择实操课程'"
					expand-trigger="click"
					:options="options"
					check-strategy="child"
					remote
					:on-load="optionsLoader"
					@update:value="selectClassObjFn"
					v-if="!data.classObj"
				></n-cascader>
				<n-tag
					type="primary"
					v-else
					closable
					@click="emit('update:data', { classObj: '' })"
					>{{ data.classObj.title }}</n-tag
				>
			</n-space>
			<template v-if="data.classObj">
				<n-space align="center">
					<n-text type="default">课中操作：</n-text>
					<n-button
						@click="startClassFn"
						type="success"
						v-if="data.classObj.status == 0"
					>
						开始实操
					</n-button>
					<n-button
						@click="endClassFn"
						type="error"
						v-if="data.classObj.status == 1"
					>
						结束实操
					</n-button>
					<n-button
						@click="watchClassFn"
						type="info"
						v-if="data.classObj.status == 1"
					>
						观察学生
					</n-button>
					<n-button @click="watchClassFn" type="info"> 查看作业 </n-button>
				</n-space>
				<n-space
					align="center"
					v-if="data.classObj && data.classObj.status == 2"
				>
					<n-text type="default">课后作业：</n-text>
					<n-button @click="afterClassFn" type="success"> 授权作业 </n-button>
				</n-space>
			</template>
		</template>
		<template v-else>
			<h1>云教室</h1>
			<n-alert :type="classStatusArr[data.classObj.status] && classStatusArr[data.classObj.status].type || 'warning'" title="当前状态">
				{{classStatusArr[data.classObj.status] && classStatusArr[data.classObj.status].msg || '等待选择实操课'}}
			</n-alert>
			<n-space>
				<n-button type="warning" @click="connectionFn">举手</n-button>
			</n-space>
		</template>
	</n-space>
</template>

<script setup>
	import {
		useMessage,
		NButton,
		NAlert,
		NSpace,
		NText,
		NTag,
		NCascader,
	} from "naive-ui";
	import { ref, inject, onMounted, computed, watchEffect } from "vue";
	import { api } from "@/components/API";
	const classStatusArr = {
		0: {
			type: 'info',
			msg: '等待开始'
		},
		1: {
			type: 'success',
			msg: '实操课，练习中'
		},
		2: {
			type: 'error',
			msg: '练习结束，等待点评'
		}
	};

	const $message = useMessage();
	const props = defineProps({
		data: Object,
	});
	const data = computed(() => {
		return props.data;
	});
	const emit = defineEmits(["router", "update:data"]);

	const options = ref([]);
	const optionsLoader = async (opt) => {
		if (opt) {
			console.log(opt);
			api.cloudclass
				.list({
					homeworkId: opt.value,
				})
				.then(
					(data) => {
						console.log(data);
						opt.children = data.result.map((a) => {
							return {
								label: a.title,
								value: a.id,
								isLeaf: true,
								data: a,
							};
						});
					},
					(err) => {
						// emit("router", { router: "Iframe", redirect: "Home" });
					}
				);
		} else {
			api.homework.list().then(
				(data) => {
					console.log(data);
					options.value = data.result.map((a) => {
						return {
							label: a.title,
							value: a.id,
							isLeaf: false,
						};
					});
				},
				(err) => {
					// emit("router", { router: "Iframe", redirect: "Home" });
				}
			);
		}
	};
	optionsLoader();
	const selectClassObjFn = (v, opt) => {
		if (!data.value.isTeacher) {
			return $message.info("只有老师才可以操作");
		}
		console.log({ v, opt });
		emit("update:data", { classObj: opt.data });
	};

	const startClassFn = (v) => {
		api.cloudclass
			.start({ cloudClassId: data.value.classObj.id })
			.then((res) => {
				console.log(res);
				emit("update:data", {
					classObj: Object.assign({}, data.value.classObj, {
						status: 1,
					}),
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const endClassFn = (v) => {
		api.cloudclass
			.end({ cloudClassId: data.value.classObj.id })
			.then((res) => {
				console.log(res);
				emit("update:data", {
					classObj: Object.assign({}, data.value.classObj, {
						status: 2,
					}),
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const watchClassFn = (v) => {
		emit("router", { router: "Dashboard" });
	};
	const afterClassFn = (v) => {
		emit("router", {router: "Screen"});
	};
	const connectionFn = () => {
		console.log("connectionFn");
	};
</script>

<style scoped>
.testWrap {
	padding: 20px;
}
</style>
