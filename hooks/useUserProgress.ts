import useSWR from "swr";

interface UserProgress {
  hasProducts: boolean;
  hasBlogs: boolean;
  hasCollections: boolean;
  hasUserInfo: boolean;
}

const fetcher = async (url: string): Promise<UserProgress> => {
  if (typeof window === "undefined") throw new Error("SSR not supported");

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const [productsRes, blogsRes, collectionsRes, userInfoRes] =
    await Promise.all([
      fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/blog", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/collections", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/userInfo", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

  const [productsData, blogsData, collectionsData] = await Promise.all([
    productsRes.ok ? productsRes.json() : { products: [] },
    blogsRes.ok ? blogsRes.json() : { blogs: [] },
    collectionsRes.ok ? collectionsRes.json() : { collections: [] },
  ]);

  return {
    hasProducts: productsData.products && productsData.products.length > 0,
    hasBlogs: blogsData.blogs && blogsData.blogs.length > 0,
    hasCollections:
      collectionsData.collections && collectionsData.collections.length > 0,
    hasUserInfo: userInfoRes.ok,
  };
};

export const useUserProgress = () => {
  const { data, error, mutate } = useSWR(
    typeof window !== "undefined" ? "/user-progress" : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    progress: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
