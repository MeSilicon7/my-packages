export async function action({ request }: { request: Request }) {
  const formData = await request.json();
  console.log("Form data received:", formData);

  // Here you can process the form data as needed, e.g., save to a database

  return Response.json({ message: "Form submitted successfully", data: formData });
}