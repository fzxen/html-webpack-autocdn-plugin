import { createApp, defineComponent } from "vue";

const app = createApp(
  defineComponent({
    name: "APP",
    template: "<h1>test for plugin</h1>",
  })
);

app.mount("#app");
