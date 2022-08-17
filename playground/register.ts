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
		fastboard.manager.addApp(App);
	},
});
apps.push({
	kind: "EmbeddedPage",
	label: '云教室(外部)',
	icon: logo,
	onClick: fastboard => {
		if (fastboard.room.uid != App.attributes.teacherUid){
			return false;
		}
		if (Object.values(fastboard.manager.apps).find(app => app.kind === App.kind)) {
			return false;
		}
		fastboard.manager.addApp({
			kind: "EmbeddedPage",
			name: "CloudClass-iframe",
			options: {
				title: 'CloudOS-云教室-iframe'
			},
			attributes: {
				src: 'https://local.cloudos.com:3000/homework?flat=1',
				teacherUid: 'kongkang'
			},
		});
	},
});