import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DonationService } from "../../api/donationApi";
import { DonationType } from "./types";

export interface AddDonationPayload {
  donorId: number;
  staffId: number;
  amount: number;
  purpose: string;
  paymentMode: string;
  transactionId: string;
  campaign: string;
  category: string;
  date: string;
}

export const useDonations = () => {
  const donationService = DonationService();
  const queryClient = useQueryClient();

  const donationsQuery = useQuery<DonationType[]>({
    queryKey: ["donations"],
    queryFn: async () => {
      const res = await donationService.getAllDonations();
      return res;
    },
  });

  const addDonationMutation = useMutation({
    mutationKey: ["add-donation"],
    mutationFn: (payload: AddDonationPayload) =>
      donationService.addDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
  

  return {
    /* Query */
    donations: donationsQuery.data,
    isDonationsLoading: donationsQuery.isLoading || donationsQuery.isFetching,
    isDonationsError: donationsQuery.isError,

    addDonation: addDonationMutation.mutateAsync,
    isAddingDonation: addDonationMutation.isPending ,
  };
};
