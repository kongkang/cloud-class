<template>
	<n-config-provider :theme="themeMode" :locale="zhCN" :date-locale="dateZhCN">
		<n-dialog-provider>
			<n-message-provider>
				<n-tag type="info" class="testData"
					>{{
						{
							router: $store.state.router,
							uid,
							teacherUid,
							isTeacher,
							redirect,
							classObj: (classObj && classObj.id) || "",
							classObj_status: (classObj && classObj.status) || "",
							practiceObj: (practiceObj && practiceObj.id) || "",
						}
					}}<br />---<br />{{
						Object.keys($store.state).map((k) => {
							return [k, typeof $store.state[k]];
						})
					}}</n-tag
				>
				<n-dropdown
					trigger="click"
					:options="routerOpt"
					route
					@select="pubRouterFn"
					v-if="isTeacher && routerOpt.length"
				>
					<n-button class="allToRouter">全员跳转</n-button>
				</n-dropdown>
				<component
					:is="router"
					:data="{
						uid,
						teacherUid,
						isTeacher,
						redirect,
						classObj,
						practiceObj,
					}"
					@router="routerFn"
					@update:data="updateDataFn"
				/>
			</n-message-provider>
		</n-dialog-provider>
	</n-config-provider>
</template>

<script setup>
	// This starter template is using Vue 3 <script setup> SFCs
	// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
	import Home from "./components/Home.vue";
	import Screen from "./components/Screen.vue";
	import Playback from "./components/Playback.vue";
	import Dashboard from "./components/Dashboard.vue";
	import Login from "./components/Login.vue";
	import { setToken, api, isLogin } from "./components/API";

	import {
		NMessageProvider,
		NDialogProvider,
		NConfigProvider,
		NTag,
		NSpace,
		NDropdown,
		NButton,
		lightTheme,
		darkTheme,
		zhCN,
		dateZhCN,
	} from "naive-ui";
	import {
		ref,
		shallowRef,
		inject,
		onMounted,
		computed,
		watchEffect,
		watch,
	} from "vue";

	const redirect = shallowRef("");
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
		practiceObj: {},
	});
	const real_router = ref($store.state.router);
	const real_classObj = ref($store.state.classObj);
	const real_practiceObj = ref($store.state.practiceObj);
	const userInfo = ref(null);
	const actions = {
		Login,
		Home,
		Screen,
		Playback,
		Dashboard,
	};
	const routerOpt = computed(() => {
		let arr = [
			{
				label: "首页",
				key: "Home",
			},
		];
		if (real_classObj.value.status == 1) {
			arr.push({
				label: "上机",
				key: "Screen",
			});
		} else if (real_classObj.value.status == 2) {
			arr.push({
				label: "作业列表",
				key: "Dashboard",
			});
		}
		if (real_practiceObj.value.id) {
			arr.push({
				label: "回放",
				key: "Playback",
			});
		}
		return arr;
	});
	const router = computed({
		get() {
			return actions[real_router.value];
		},
		set(v) {
			if (v) {
				real_router.value = v;
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
			if (
				v.id == real_classObj.value.id &&
				v.status == real_classObj.value.status
			) {
				return console.warn("classObj, 啥也没变");
			}
			console.warn("classObj:", v);
			real_classObj.value = v;
			$store.setState({ classObj: v });
			switch (v.status) {
				case 1:
					$store.setState({ router: "Screen" });
					break;
				case 0:
				case 2:
					$store.setState({ router: "Home" });
					break;
			}
		},
	});
	const practiceObj = computed({
		get() {
			return real_practiceObj.value;
		},
		set(v) {
			if (
				v.id == real_practiceObj.value.id &&
				v.status == real_practiceObj.value.status
			) {
				return console.warn("practiceObj, 啥也没变");
			}
			console.warn("practiceObj:", v);
			real_practiceObj.value = v;
			$store.setState({ practiceObj: v });
		},
	});

	const pubRouterFn = (v) => {
		console.log(v);
		router.value = v;
		$store.setState({ router: v });
	};
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
		if (v.practiceObj !== undefined) {
			practiceObj.value = v.practiceObj;
		}
		if (v.practice !== undefined) {
			console.log(v.practice);
		}
		if (v.token) {
			setToken(v.token)
				.then((data) => {
					userInfo.value = data;
				})
				.catch(console.error);
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
		bottom: 5px;
		z-index: 999;
		width: 30%;
		overflow: hidden;
		white-space: pre-wrap;
		height: auto;
		text-align: left;
		pointer-events: none;
		display: none;
	}
	.allToRouter {
		position: absolute;
		right: 10px;
		top: 10px;
	}
	.testData {
		left: auto;
		top: auto;
		right: 5px;
		bottom: 5px;
	}
}
</style>