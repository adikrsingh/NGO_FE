import React from 'react';
import axios from 'axios';

export const useApi = () => {

	const baseApi = (headers?: Record<any, any>) => {
		const instance = axios.create({
			// baseURL: "https://ngo-platform-production.up.railway.app/api",
			baseURL: "http://localhost:8080/api",
			timeout: 120000,
			withCredentials: true,
			headers: {
				...headers,
			},
		});

		return instance;
	};

	return { baseApi };
};
