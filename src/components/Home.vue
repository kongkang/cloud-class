<template>
	<n-space vertical class="testWrap">
		<template v-if="data.isTeacher">
			<h1>云教室：老师端{{isStart}}</h1>
			<n-alert
				:type="
					(classStatusArr[data.classObj.status] &&
						classStatusArr[data.classObj.status].type) ||
					'warning'
				"
				title="当前状态"
			>
				{{
					(classStatusArr[data.classObj.status] &&
						classStatusArr[data.classObj.status].msg) ||
					"等待选择实操课"
				}}
			</n-alert>
			<n-space align="center">
				<n-text type="default">课前准备：</n-text>
				<template v-if="!hasClassId">
					<n-cascader
						:value="(data.classObj && data.classObj.id) || ''"
						placeholder="请选择实操课程"
						expand-trigger="click"
						:options="options"
						check-strategy="child"
						remote
						:on-load="optionsLoader"
						@update:value="selectClassObjFn"
						v-if="!hasClassId"
					></n-cascader>
					<n-button type="info" @click="options=[];optionsLoader()"> 刷新 </n-button>
					<n-button
						type="warning"
						tag="a"
						:href="config.wwwUrl + '/homework'"
						target="_blank"
					>
						备课（外链）
					</n-button>
				</template>
				<template v-else>
					<n-tag
						type="primary"
						closable
						@close="emit('update:data', { classObj: '' })"
						>{{ data.classObj.title }}</n-tag
					>
				</template>
			</n-space>
			<template v-if="hasClassId">
				<n-space align="center">
					<n-text type="default">课中操作：</n-text>
					<template v-if="data.classObj.status == 0">
						<n-button @click="startClassFn" type="warning" v-if="isStart"> 实操开机 </n-button>
						<n-button @click="startPracticeFn" type="success"> 学生上机 </n-button>
					</template>
					<template v-if="data.classObj.status == 1">
						<n-button @click="endClassFn" type="error"> 结束实操 </n-button>
					</template>
					<template v-if="data.classObj.status >= 1">
						<n-button @click="watchClassFn" type="info">
							实操列表
						</n-button>
					</template>
				</n-space>
				<n-space align="center" v-if="hasClassId && data.classObj.status == 2">
					<n-text type="default">课后作业：</n-text>
					<n-button @click="afterClassFn" type="success"> 授权作业 </n-button>
				</n-space>
			</template>
		</template>
		<template v-else>
			<h1>云教室：学生端</h1>
			<n-alert
				:type="
					(classStatusArr[data.classObj.status] &&
						classStatusArr[data.classObj.status].type) ||
					'warning'
				"
				title="当前状态"
			>
				{{
					(classStatusArr[data.classObj.status] &&
						classStatusArr[data.classObj.status].msg) ||
					"等待选择实操课"
				}}
			</n-alert>
			<n-space v-if="data.classObj.status == 1">
				<n-button type="warning" @click="startPracticeFn">开始实操</n-button>
			</n-space>
			<n-space v-if="data.classObj.status == 2">
				<n-button type="info" @click="watchClassFn">查看作业</n-button>
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
	import { api, config, isLogin } from "@/components/API";
	const classStatusArr = {
		0: {
			type: "info",
			msg: "等待开始",
		},
		1: {
			type: "success",
			msg: "实操课，练习中",
		},
		2: {
			type: "warning",
			msg: "练习结束，等待点评",
		},
	};

	const $message = useMessage();
	const props = defineProps({
		data: Object,
	});
	const data = computed(() => {
		return props.data;
	});
	const hasClassId = computed(() => {
		return !!(data.value.classObj && data.value.classObj.id);
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
						console.error(err);
						emit("router", { router: "Login", redirect: "Home" });
					}
				);
		} else {
			if (options.value.length > 0) {
				return;
			}
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
					options.value.unshift({
						label: "请选择实操课",
						value: "",
						isLeaf: true,
						disabled: true,
					});
				},
				(err) => {
					console.error(err);
					emit("router", { router: "Login", redirect: "Home" });
				}
			);
		}
	};
	optionsLoader();
	const selectClassObjFn = (v, opt) => {
		if (!data.value.isTeacher) {
			return $message.info("只有老师才可以操作");
		}
		isStart.value = v.status == 1;
		console.log({ v, opt });
		emit("update:data", { classObj: opt.data });
	};

	const isStart = ref(false);
	const loadData = ()=>{
		if (!data.value.isTeacher){
			return false;
		}
		api.cloudclass
			.get({ cloudClassId: data.value.classObj.id })
			.then((res) => {
				isStart.value = res.status == 1;
			})
			.catch((err) => {
				console.log(err);
				$message.error(err.msg);
			});
	};
	loadData();
	const startClassFn = (v) => {
		api.cloudclass
			.start({ cloudClassId: data.value.classObj.id })
			.then((res) => {
				isStart.value = true;
				$message.success("正在开机");
			})
			.catch((err) => {
				console.log(err);
				$message.error(err.msg);
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
		emit("router", { router: "Screen" });
	};

	const startPracticeFn = (v) => {
		if (data.value.isTeacher) {
			emit("update:data", {
				classObj: Object.assign({}, data.value.classObj, {
					status: 1,
				}),
			});
		}else{
			emit("router", { router: "Screen" });
		}
	};
</script>

<style scoped>
.testWrap {
	padding: 20px;
}
</style>
