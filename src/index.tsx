import React from "react";
import { renderToReadableStream } from "react-dom/server";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export const Page = () => {
  return <h1>Hello World!</h1>;
};

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let controller = new AbortController();
    let didError = false;
    try {
      let stream = await renderToReadableStream(
        <html>
          <body>
            <Page />
          </body>
        </html>,
        {
          signal: controller.signal,
          onError(error) {
            didError = true;
            console.error(error);
          },
        }
      );

      // This is to wait for all Suspense boundaries to be ready. You can uncomment
      // this line if you want to buffer the entire HTML instead of streaming it.
      // You can use this for crawlers or static generation:

      // await stream.allReady;

      return new Response(stream, {
        status: didError ? 500 : 200,
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      return new Response("<!doctype html><p>Loading...</p>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }
  },
};
