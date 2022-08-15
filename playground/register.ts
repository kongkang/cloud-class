import { register, apps } from "@netless/fastboard";
import { inject } from "vue";
import App from "@/index";
import logo from "@/logo.svg";

export const registering = register({ kind: App.kind, src: App });
apps.clear();
apps.push({
	kind: App.kind,
	label: App.kind.replace(/([a-z])([A-Z])/g, "$1 $2"),
	icon: logo,
	onClick: fastboard => {
		fastboard.manager.addApp(App);
	},
});