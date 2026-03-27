import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Minimal Cloudflare adapter configuration.
// Cache backends (R2/KV) will be added in a later phase
// only when there is a concrete need for incremental cache persistence.
export default defineCloudflareConfig({});
