import { useEffect, useState } from "react";

export default function useFetch(fetchFn, initialValue) {
  const [isfetching, setIsFetching] = useState();
  const [error, setError] = useState();
  const [fetchedData, setFetchedData] = useState(initialValue);

  useEffect(() => {
    async function fecthplaces() {
      setIsFetching(true);
      try {
        const places = await fetchFn();
        setFetchedData(places);
      } catch (error) {
        setError({ message: error.message || "Failed to fetch data." });
      }
      setIsFetching(false);
    }

    fecthplaces();
  }, [fetchFn]);

  return {
    isfetching,
    fetchedData,
    setFetchedData,
    error,
  };
}
