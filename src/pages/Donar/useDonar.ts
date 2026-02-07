import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DonorService } from "../../api/donorApi";

export const useDonars = () => {
  const donorService = DonorService();
  const queryClient = useQueryClient();

  const donarsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      return donorService.getAllDonors();
    },
    placeholderData: keepPreviousData,
  });

  // CHECK DONOR BY PAN

  const getDonorByPan = async (pan: string) => {
    return donorService.getDonorByPan(pan);
  };

  /*ADD DONOR*/
  const addDonorMutation = useMutation({
    mutationKey: ["add-donor"],
    mutationFn: (payload: any) => donorService.addDonor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });

  return {
    donars: donarsQuery.data,
    isDonarsLoading: donarsQuery.isLoading || donarsQuery.isFetching,
    isDonarsError: donarsQuery.isError,

    getDonorByPan,

    addDonor: addDonorMutation.mutateAsync,
    isAddingDonor: addDonorMutation.isPending,
    addDonorError: addDonorMutation.error,
  };
};
