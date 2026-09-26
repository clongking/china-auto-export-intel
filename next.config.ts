import type { NextConfig } from "next";

// GitHub Pages 项目站点挂在 /<repo> 子路径下；本地开发不设置该变量即为根路径。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
