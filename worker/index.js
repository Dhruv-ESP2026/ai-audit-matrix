import { getAssetFromKV, NotFoundError, MethodNotAllowedError } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'

const assetManifest = JSON.parse(manifestJSON)

export default {
  async fetch(request, env, ctx) {
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      )
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof MethodNotAllowedError) {
        // SPA fallback: serve index.html for all unmatched routes
        const url = new URL(request.url)
        url.pathname = '/index.html'
        const indexRequest = new Request(url.toString(), request)
        return await getAssetFromKV(
          { request: indexRequest, waitUntil: ctx.waitUntil.bind(ctx) },
          { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
        )
      }
      return new Response('Internal Error', { status: 500 })
    }
  },
}
