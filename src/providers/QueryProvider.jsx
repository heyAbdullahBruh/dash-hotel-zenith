import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404 or 403
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message || "Operation failed");
      },
    },
  },
});

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

// Custom hooks for common queries
export const useFoodsQuery = (params) => {
  return useQuery({
    queryKey: ["foods", params],
    queryFn: () => foodService.getAllFoods(params),
  });
};

export const useCreateFoodMutation = () => {
  return useMutation({
    mutationFn: (foodData) => foodService.createFood(foodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      toast.success("Food item created successfully");
    },
  });
};
