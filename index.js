export default {
  async fetch(request, env) {
    if (request.method !== "PUT") {
      return new Response("Method not allowed", { status: 405 });
    }
    if (!authorized(request, env)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Use URL to determine object key
    // i.e. 'http://example.com/picture.jpg' -> 'picture.jpg'
    const pathname = new URL(request.url).pathname;
    const objectKey = pathname.replace(/^\/+/, "");

    await env.WEB.put(objectKey, request.body);
    return new Response("Success");
  },
};

function authorized(request, env) {
  const token = request.headers.get("X-Auth-Token");
  return token === ACCESS_TOKEN;
}
