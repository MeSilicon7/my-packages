import { useFetch } from "@mesilicon7/use-fetch"

export default function FetchTest() {
  const { data, error } = useFetch({ url: "/fetch-test-api", options: {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  }, revalidateInterval: 10000 });

  if (error) return <div>Error loading fetch test data</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <p>{data.message}</p>
    </div>
  );
}
