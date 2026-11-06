import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.guiting.shiguang",
  appName: "桂庭拾光",
  webDir: "dist",
  backgroundColor: "#e7bfc0",
  android: {
    backgroundColor: "#e7bfc0",
    allowMixedContent: false
  },
  ios: {
    backgroundColor: "#e7bfc0",
    contentInset: "automatic"
  }
};

export default config;
