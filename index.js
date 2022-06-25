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
      await env.WEB.put(objectKey, request.body);
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

function authorized(request, env) {
  const token = request.headers.get("X-Auth-Token");
  return token === env.ACCESS_TOKEN;
}
