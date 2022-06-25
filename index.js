export default {
  async fetch(request, env) {
    if (!["GET", "PUT", "DELETE"].includes(request.method)) {
      return new Response("Method not allowed", { status: 405 });
    }
    if (!authorized(request, env)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // List bucket objects
    if (request.method === "GET") {
      const objects = await env.WEB.list();
      const keys = objects.objects.map((object) => object.key);
      return new Response(JSON.stringify({ keys }), { status: 200 });
    }

    // Use URL to determine object key
    // i.e. 'http://example.com/picture.jpg' -> 'picture.jpg'
    if (request.method === "PUT") {
      const pathname = new URL(request.url).pathname;
      const objectKey = pathname.replace(/^\/+/, "");
      await env.WEB.put(objectKey, request.body, {
        httpMetadata: generateHttpMetadata(objectKey),
      });
      return new Response("Success", { status: 201 });
    }

    // Delete object, using URL to determine object key
    if (request.method === "DELETE") {
      const pathname = new URL(request.url).pathname;
      const objectKey = pathname.replace(/^\/+/, "");
      await env.WEB.delete(objectKey);
      return new Response("Success", { status: 204 });
    }
  },
};

const mimeTypes = new Map([
  ["aac", "audio/aac"],
  ["arc", "application/x-freearc"],
  ["avi", "video/x-msvideo"],
  ["avif", "image/avif"],
  ["css", "text/css"],
  ["csv", "text/csv"],
  ["doc", "application/msword"],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ["gz", "application/gzip"],
  ["gpx", "application/gpx+xml"],
  ["gif", "image/gif"],
  ["html", "text/html"],
  ["ico", "image/vnd.microsoft.icon"],
  ["ics", "text/calendar"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["js", "text/javascript"],
  ["json", "application/json; charset=utf-8"],
  ["mid", "audio/x-midi"],
  ["midi", "audio/x-midi"],
  ["mpeg", "video/mpeg"],
  ["png", "image/png"],
  ["pdf", "application/pdf"],
  ["rar", "application/vnd.rar"],
  ["rtf", "application/rtf"],
  ["sh", "application/x-sh"],
  ["svg", "image/svg+xml"],
  ["tar", "application/x-tar"],
  ["tif", "image/tiff"],
  ["tiff", "image/tiff"],
  ["txt", "text/plain"],
  ["usdz", "model/usd"],
  ["wav", "audio/wav"],
  ["weba", "audio/webm"],
  ["webm", "video/webm"],
  ["webmanifest", "application/manifest+json"],
  ["webp", "image/webp"],
  ["xhtml", "application/xhtml+xml"],
  ["xml", "application/xml"],
  ["zip", "application/zip"],
]);

function authorized(request, env) {
  const token = request.headers.get("X-Access-Token");
  return token === env.ACCESS_TOKEN;
}

function generateHttpMetadata(objectKey) {
  const extension = objectKey.split(".").pop();

  let seconds = "2592000";
  if (["html", "xml", "json", "txt"].includes(extension)) seconds = "900";
  if (["css", "js"].includes(extension)) seconds = "172800";

  return {
    contentType: mimeTypes.get(extension) || "application/octet-stream",
    cacheControl: `public, max-age=${seconds}`,
  };
}
