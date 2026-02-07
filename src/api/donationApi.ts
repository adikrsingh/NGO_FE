import { DonationType } from "../pages/Donations/types";
import { useApi } from "./useApi";
import { RecentContribution } from "../types/RecentContribution";
import { TotalDonationSummary } from "../types/TotalDonationSummary";
import { StaffDonationDashboard } from "../types/StaffDonationDashboard";
import { PaidVsPending } from "../types/PaidVsPending";
import { MonthlyRunRate } from "../types/MonthlyRunRate";
import { Pending80GSummary } from "../types/Pending80GSummary";

export const DonationService = () => {
	const { baseApi } = useApi();

	const getAllDonations = async (): Promise<DonationType[]> => {
		const response = await baseApi().get(`/donations`);
		return response?.data;	
	};

	const addDonation = async (payload: any): Promise<DonationType> => {
		const response = await baseApi().post(`/donations`, payload);
		return response?.data;
	};

	/**
	 * Dashboard: Recent Contributions (Top 10)
	 *
	 * @param employeeId - logged-in employee ID
	 *
	 * TEMP:
	 * - Pass 1 for now
	 *
	 * TODO:
	 * - Replace with employeeId from auth context / JWT
	 */
	const getRecentContributions = async (
		employeeId: number
	): Promise<RecentContribution[]> => {
		const response = await baseApi().get(
		`/donations/donor/recent-contributions/${employeeId}`
		);
		return response?.data;
	};

	const getTotalDonationSummary = async (
		staffId: number
	): Promise<TotalDonationSummary> => {
		const response = await baseApi().get(
		`/donations/total-donations/${staffId}`
		);
		return response?.data;
	};

	const getStaffDonationDashboard = async (
		staffId: number
		): Promise<StaffDonationDashboard> => {
		const response = await baseApi().get(
			`/donations/staff/${staffId}`
		);
		return response?.data;
	};

	const getPending80GDonations = async () => {
		const response = await baseApi().get("/donations/80g/pending");
		return response.data;
	};

	const getPending80GSummary = async () => {
		const response = await baseApi().get("/donations/80g/summary");
		return response.data as Pending80GSummary;
};

	const getPendingReceiptDonations = async () => {
		const response = await baseApi().get(
			"/donations/receipts/pending"
		);
		return response.data;
	};

	const getPaidVsPendingForMonth = async (
		staffId: number
		): Promise<PaidVsPending> => {
		const response = await baseApi().get(
			`/donations/dashboard/paid-vs-pending/${staffId}`
		);
		return response.data;
	};

	const getDonationFlowStats = async () => {
		const res = await baseApi().get("/donations/flow-stats");
		return res.data;
	};

	const getDonationsByMonth = async (
		staffId: number,
		year: number,
		month: number
		) => {
		const res = await baseApi().get(
			`/donations/by-month`,
			{
			params: { staffId, year, month },
			}
		);
		return res.data;
	};

	const getDonationsByDateRange = async (
		staffId: number,
		from: string,
		to: string
		) => {
		const res = await baseApi().get("/donations/date-range", {
			params: { staffId, from, to },
		});
		return res.data;
	};


	const getMonthlyRunRate = async (
		staffId: number,
		year: number,
		month: number
		): Promise<MonthlyRunRate> => {
		const response = await baseApi().get(
			`/donations/dashboard/monthly-run-rate/${staffId}`,
			{
			params: { year, month },
			}
	)
  return response.data;
};

	return {
		getAllDonations,
		addDonation,
		getRecentContributions,
		getTotalDonationSummary,
		getStaffDonationDashboard,
		getPending80GDonations,
		getPendingReceiptDonations,
		getPaidVsPendingForMonth,
		getDonationsByMonth,
		getMonthlyRunRate,
		getPending80GSummary,
		getDonationFlowStats,
		getDonationsByDateRange,
	};
};
