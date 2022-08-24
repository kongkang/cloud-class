// import { NetlessApp } from "@netless/window-manager";

import { createApp } from "vue";
// import styles from "./style.css?inline";
import App from './App.vue'
// import App from "./components/HelloWorld.vue";

const CloudClassApp = {
    kind: "cloud-class",
    name: "CloudClass",
    options: {
        title: 'CloudOS-云教室'
    },
    attributes: {
        teacherUid: 'teacherUid'
    },
    setup(context) {
        console.warn('init?');
        const box = context.getBox();
        // box.mountStyles(styles);

        const $content = document.createElement("div");
        $content.className = "app-cloud-class";
        box.mountContent($content);

        const app = createApp(App).provide("context", context).provide("box", box);

        app.mount($content);

        context.emitter.on("destroy", () => {
            app.unmount();
        });
    }
};

export default CloudClassApp;