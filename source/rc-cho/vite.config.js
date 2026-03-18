import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    // 외부에서 서버 IP로 접속 가능 + 회사소개 서비스 포트 고정
    server: {
        host: true,
        port: 8888,
    },
});
