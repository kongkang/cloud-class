<template>
	<n-config-provider :theme="themeMode" :locale="zhCN" :date-locale="dateZhCN">
		<n-message-provider>
			<n-tag type="warning" class="testRouter"
				>{{ real_router }}{{ $store.state }}</n-tag
			>
			<n-tag type="info" class="testData">{{
				{
					uid,
					teacherUid,
					isTeacher,
					redirect,
					classObj: (classObj && classObj.id) || "",
				}
			}}</n-tag>
			<component
				:is="router"
				:data="{ uid, teacherUid, isTeacher, redirect, classObj }"
				@router="routerFn"
				@update:data="updateDataFn"
			/>
		</n-message-provider>
	</n-config-provider>
</template>

<script setup>
	// This starter template is using Vue 3 <script setup> SFCs
	// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
	import Home from "./components/Home.vue";
	import Screen from "./components/Screen.vue";
	import Dashboard from "./components/Dashboard.vue";
	import Login from "./components/Login.vue";
	import { setToken, api, isLogin } from "./components/API";

	import {
		NMessageProvider,
		NConfigProvider,
		NTag,
		NSpace,
		lightTheme,
		darkTheme,
		zhCN,
		dateZhCN,
	} from "naive-ui";
	import { ref, inject, onMounted, computed, watchEffect, watch } from "vue";

	const redirect = ref("");
	const context = inject("context");
	const box = inject("box");
	// const $store = context.storage;
	// $store.ensureState({
	// 	router: "Home",
	// 	classObj: {},
	// });
	const $store = context.createStorage("cloudclass", {
		router: "Home",
		classObj: {},
	});
	const real_router = ref($store.state.router);
	const real_classObj = ref($store.state.classObj);
	const actions = {
		Login,
		Home,
		Screen,
		Dashboard,
	};
	const router = computed({
		get() {
			if (isLogin() && !isTeacher.value && classObj.value.status == 1){
				return Screen;
			}
			return actions[real_router.value];
		},
		set(v) {
			if (v) {
				real_router.value = v;
				$store.setState({ router: v });
			}
		},
	});
	const themeMode = computed(() => {
		return box.darkMode ? darkTheme : lightTheme;
	});

	const uid = computed(() => {
		let room = context.getRoom();
		return room.uid;
	});
	const teacherUid = computed(() => {
		let attr = context.getAttributes();
		return attr.teacherUid;
	});
	const isTeacher = computed(() => {
		let attr = context.getAttributes();
		return attr.teacherUid == uid.value;
	});
	const classObj = computed({
		get() {
			return real_classObj.value;
		},
		set(v) {
			if (v.id == real_classObj.value.id && v.status == real_classObj.value.status) {
				return console.warn("classObj, 啥也没变");
			}
			console.warn("classObj:", v);
			real_classObj.value = v;
			$store.setState({ classObj: v });
		},
	});

	const routerFn = (action) => {
		console.warn("routerFn-1", action);
		if (!actions[action.router]) {
			action.router = "Home";
		}
		console.warn("routerFn-2", action);
		// return false;
		router.value = action.router;
		action.redirect &&
			action.redirect != "Login" &&
			(redirect.value = action.redirect);
	};
	const updateDataFn = (v) => {
		console.log("updateDataFn", v);
		if (v.classObj !== undefined) {
			classObj.value = v.classObj;
		}
		if (v.token) {
			setToken(v.token);
			api.userinfo
				.detail()
				.then((res) => {
					console.log("userinfo", res);
				})
				.catch((err) => {
					console.log("userinfo", err);
				})
				.finally(() => {
					console.log("userinfo", "finally");
				});
		}
	};
	onMounted(() => {
		$store.addStateChangedListener(() => {
			if (!isTeacher.value && router.value != $store.state.router) {
				console.warn("router changed", $store.state.router);
				router.value = $store.state.router;
			}
			if ($store.state.classObj) {
				console.warn("classObj changed", $store.state.classObj);
				classObj.value = $store.state.classObj;
			}
		});
		if (!isTeacher.value) {
			box.setReadonly(true);
		}
	});
	watchEffect(() => {
		console.log("App.vue: router =", router.value);
		console.log("App.vue: classObj =", classObj.value);
	});
</script>

<style lang="scss" scope>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
	.testRouter,
	.testData {
		position: absolute;
		left: 5px;
		top: 5px;
		z-index: 999;
		width: 30%;
		overflow: hidden;
		white-space: pre-wrap;
		height: auto;
		text-align: left;
		pointer-events: none;
	}
	.testData {
		left: auto;
		top: auto;
		right: 5px;
		bottom: 5px;
	}
}
</style>