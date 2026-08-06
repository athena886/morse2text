import { mkdir, writeFile } from "node:fs/promises";
const workerUrl = new URL("../dist/server/index.js", import.meta.url); workerUrl.searchParams.set("export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);
const routes = ["/"];
for (const route of routes) {
 const response=await worker.fetch(new Request(`https://morse2text.com${route}`,{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
 if(!response.ok)throw new Error(`Static export failed for ${route}: ${response.status}`);
 let html=await response.text(); html=html.replace(/<!--\$[^>]*-->|<!--\/\$-->/g,"");
 const dir=new URL(`../dist/client${route==="/"?"":route}/`,import.meta.url); await mkdir(dir,{recursive:true}); await writeFile(new URL("index.html",dir),html);
}
console.log(`Static export ready: ${routes.length} HTML pages`);
