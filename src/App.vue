<template>
	<n-config-provider :theme="themeMode" :locale="zhCN" :date-locale="dateZhCN">
		<n-message-provider>
			<n-tag type="warning" class="testRouter">{{ $store.state }}</n-tag>
			<n-tag type="info" class="testData">{{
				{ uid, teacherUid, isTeacher, redirect, classObj: classObj.id }
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
	import Iframe from "./components/Iframe.vue";
	import { setToken, api } from "./components/API";

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
	const $store = context.createStorage("router", {
		router: "Home",
		classObj: "",
	});
	const real_router = ref($store.state.router);
	const real_classObj = ref($store.state.classObj);
	const real_state = computed(() => {
		return {
			router: real_router.value,
			classObj: real_classObj.value,
		};
	});
	const router = computed({
		get() {
			const actions = {
				Iframe,
				Home,
				Screen,
				Dashboard,
			};
			return actions[real_router.value];
		},
		set(v) {
			if (v) {
				if (isTeacher.value) {
					real_router.value = v;
					$store.setState({ router: v });
					return;
				}
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
			console.warn("classObj:", v);
			real_classObj.value = v;
			$store.setState({ classObj: v });
			if (isTeacher.value == false) {
				console.log("isTeacher:", isTeacher.value);
				let r = "Home";
				if (v.status == 1) {
					r = "Screen";
				}
				real_router.value = r;
				$store.setState({ router: r });
			}
		},
	});

	const routerFn = (action) => {
		console.log("routerFn", action);
		router.value = action.router;
		action.redirect &&
			action.redirect != "Iframe" &&
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
					routerFn({ router: redirect.value });
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
			console.warn("state changed", $store.state.router);
			if (!isTeacher.value && router.value != $store.state.router) {
				router.value = $store.state.router;
			}
			classObj.value = $store.state.classObj;
		});
		if (!isTeacher.value) {
			box.setReadonly(true);
		}
	});
	watchEffect(() => {
		console.log("App.vue: router =", router.value);
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
	}
	.testData {
		left: auto;
		top: auto;
		right: 5px;
		bottom: 5px;
	}
}
</style>