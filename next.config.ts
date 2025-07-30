import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		useCache: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "dreimetadaten.de",
				pathname: "/data/Serie/**",
				protocol: "https",
			},
		],
	},
};

export default nextConfig;
