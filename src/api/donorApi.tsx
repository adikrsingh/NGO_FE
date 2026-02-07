import { DonorType } from "../pages/Donar/types";
import { ActiveDonor } from "../types/ActiveDonor";
import { ActiveDonorCount } from "../types/ActiveDonorCount";
import { useApi } from "./useApi";

export const DonorService = () => {
  const { baseApi } = useApi();

  const getAllDonors = async (): Promise<DonorType[]> => {
    const response = await baseApi().get(`/donors`);
    return response?.data;
  };

  const getDonorByPan = async (pan: string): Promise<any> => {
    const response = await baseApi().get(`/donors/pan/${pan}`);
    return response?.data;
  }


  const addDonor = async (payload: any): Promise<DonorType> => {
    const response = await baseApi().post(`/donors`, payload);
    return response?.data;
  };

  const getActiveDonorCount = async (): Promise<ActiveDonorCount> => {
    const response = await baseApi().get("/donors/active/count");
    return response.data;
  };

  const getActiveDonors = async (): Promise<ActiveDonor[]> => {
    const response = await baseApi().get("/donors/active");
    return response.data;
  };

  const getDonorByPhone = async (phone: string): Promise<any> => {
    const response = await baseApi().get(`/donors/phone/${phone}`);
    return response?.data;
  }

  const searchDonorsByName = async (name: string) => {
    const response = await baseApi().get(`/donors/search`, {
      params: { name },
    });
    return response.data;
  };


  return {
    getAllDonors,
    getDonorByPan,
    addDonor,
    getActiveDonorCount,
    getActiveDonors,
    getDonorByPhone,
    searchDonorsByName,
  };
};

