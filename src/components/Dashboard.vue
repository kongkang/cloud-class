<template>
	<n-space vertical style="padding: 20px">
		<n-space>
			<n-button @click="emit('router', { router: 'Home' })" type="warning"
				>返回（Home）</n-button
			>
		</n-space>
		<n-tabs type="line" v-model:value="status" v-if="data.isTeacher">
			<n-tab :name="-1">全部</n-tab>
			<n-tab :name="0">作业中</n-tab>
			<n-tab :name="1">已提交作业：未反馈</n-tab>
			<n-tab :name="2">已提交作业：已反馈</n-tab>
		</n-tabs>
		<n-grid :cols="12" x-gap="20" y-gap="20">
			<n-gi :span="4" v-for="practice in practiceList" :key="practice.id">
				<practice-card
					:data="practice"
					:isTeacher="data.isTeacher"
					@update:data="emitFn"
					@router="emitFn"
				></practice-card>
			</n-gi>
		</n-grid>
		<n-alert type="info" v-if="practiceList.length == 0">无数据</n-alert>
		<n-pagination
			v-model:page="paginate.pageIndex"
			v-model:pageSize="paginate.pageSize"
			:page-count="paginate.pageCount"
			@update:page="loadData"
			@update:page-size="loadData"
			show-size-picker
			:page-sizes="[5, 10, 20, 30, 50]"
		/>
		<div v-if="data.isTeacher">connectionList:{{ connectionList }}</div>
	</n-space>
</template>

<script setup>
	import {
		NButton,
		NSpace,
		NTabs,
		NTab,
		NGrid,
		NGi,
		NAlert,
		NPagination,
		useMessage,
	} from "naive-ui";
	import { isLogin, api } from "@/components/API";
	import practiceCard from "@/components/practice-card.vue";
	import { ref, computed, watch } from "vue";

	const $message = useMessage();
	const emit = defineEmits(["router", "update:data"]);
	const { data } = defineProps({
		data: Object,
	});
	const practiceList = ref([]);
	const connectionList = ref([]);
	const paginate = ref({
		pageIndex: 1,
		pageSize: 10,
		pageCount: 0,
	});
	const status = ref(-1);
	const loadData = () => {
		if (data.isTeacher) {
			api.cloudclass
				.practiceList({
					cloudClassId: data.classObj.id,
					status: status.value > -1 ? status.value : undefined,
				})
				.then(
					(list) => {
						console.warn("practiceList", list);
						practiceList.value = list.result;
						paginate.value = list.paginate;
					},
					(err) => {
						if (err.code == 2002) {
							return emit("router", { router: "Login", redirect: "Dashboard" });
						}
						$message.error(err.msg);
					}
				);
			api.cloudclass.connectionList({ cloudClassId: data.classObj.id }).then(
				(list) => {
					console.warn("connectionList", list);
					connectionList.value = list;
				},
				(err) => {
					if (err.code == 2002) {
						return emit("router", { router: "Login", redirect: "Dashboard" });
					}
					$message.error(err.msg);
				}
			);
		} else {
			api.practice
				.list({
					cloudClassId: data.classObj.id,
					status: status.value > -1 ? status.value : undefined,
				})
				.then(
					(list) => {
						console.warn("practiceList", list);
						practiceList.value = list.result;
						paginate.value = list.paginate;
					},
					(err) => {
						if (err.code == 2002) {
							return emit("router", { router: "Login", redirect: "Dashboard" });
						}
						$message.error(err.msg);
					}
				);
		}
	};
	const emitFn = (v) => {
		console.log(v);
		if (v.practiceObj) {
			emit("update:data", v);
		}
		if (v.router) {
			emit("router", v);
		}
	};
	watch(() => {
		return status.value;
	}, loadData);
	loadData();
</script>

<style lang="scss">
</style>