import { register, apps } from "@netless/fastboard";
import { inject } from "vue";
import App from "@/index";
import logo from "@/logo.svg";

export const registering = register({ kind: App.kind, src: App });
apps.clear();
apps.push({
	kind: App.kind,
	label: '云教室(仅老师可开启)',
	icon: logo,
	onClick: fastboard => {
		if (fastboard.room.uid != App.attributes.teacherUid){
			return false;
		}
		if (Object.values(fastboard.manager.apps).find(app => app.kind === App.kind)) {
			return false;
		}
		fastboard.manager.addApp(Object.assign({}, App));
	},
});