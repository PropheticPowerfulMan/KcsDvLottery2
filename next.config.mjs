/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGitHubPages ? "/KcsDvLottery2" : "",
  assetPrefix: isGitHubPages ? "/KcsDvLottery2/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/KcsDvLottery2" : ""
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
