export default function getAssetPath(path: string) {
  const prefix = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
  return prefix + path;
}
