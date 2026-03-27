import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string) => {
  const isBuild = phase === PHASE_PRODUCTION_BUILD;

  return {
    output: 'standalone',
    env: {
      IS_BUILD: isBuild ? 'true' : 'false',
    },
    experimental: {
      serverActions: {
        bodySizeLimit: "10mb",
      },
    },
  };
};

export default nextConfig;
