
export async function loader({request}: {request: Request}) {
    // TODO: print request headers and cookies from headers
    console.log("Request headers:", Array.from(request.headers.entries()));
    console.log("Request cookies:", request.headers.get("cookie"));

    return Response.json({ message: "Fetch test API is working!" });
}