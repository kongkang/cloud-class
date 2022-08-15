<template>
	<n-space vertical class="testWrap">
		<h1>{{ msg }}</h1>
		<n-alert type="info" v-if="isTeacher">只有老师可见</n-alert>
		<p>uid:{{ uid }}</p>
		<p>teacherUid:{{ teacherUid }}</p>
		<p>isTeacher:{{ isTeacher }}</p>
		<n-button @click="testSDK" type="primary">老师可用: {{ count }}</n-button>
		<n-button @click="testStore" type="warning">切换页面</n-button>
	</n-space>
</template>

<script setup>
	import { useMessage, NButton, NAlert, NSpace } from "naive-ui";
	import { ref, inject, onMounted, computed, watchEffect } from "vue";

	const $message = useMessage();
	defineProps({
		msg: String,
	});

	const context = inject("context");
	const storage = context.createStorage("count", { count: 0 });
	console.log(context, context.getBox(), storage);
	const real_count = ref(storage.state.count);
	const uid = computed(() => {
		let room = context.getRoom();
		console.warn({ room });
		return room.uid;
	});
	const teacherUid = computed(() => {
		let room = context.getAttributes();
		return room.teacherUid;
	});
	const isTeacher = computed(() => {
		let attr = context.getAttributes();
		console.warn({ attr });
		return attr.teacherUid == uid.value;
	});
	const count = computed({
		get: () => {
			return real_count.value;
		},
		set(v) {
			storage.setState({ count: v });
		},
	});

	const testSDK = () => {
		console.log(count.value);
		if (!isTeacher.value) {
			return $message.info("只有老师才可以操作");
		}
		count.value++;
	};

	const testStore = () => {
		console.log('test donw');
	};
	onMounted(() => {
		storage.addStateChangedListener(() => {
			console.warn("state changed", storage.state.count);
			real_count.value = storage.state.count;
		});
	});
	watchEffect(() => {
		console.log("App.vue: count =", count.value);
	});
</script>

<style scoped>
.testWrap {
	padding: 20px;
}
</style>
