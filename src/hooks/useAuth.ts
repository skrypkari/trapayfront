import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useLogin() {
    return useMutation({
        mutationFn: async (credentials: { username: string; password: string }) => {
        const response = await api.post<any>('/auth/login', credentials);
        return response;
        },
        onSuccess: (data) => {
        console.log('Login successful:', data);
        localStorage.setItem('access_token', data.result.access_token);
        localStorage.setItem('role', data.result.role);
        },
        onError: (error) => {
        console.error('Login error:', error);
        throw new Error('Login failed');
        }
    });
}

export function useLogout() {

    return useMutation({
        mutationFn: async () => {
            await api.post('/auth/logout');
        },
        onSuccess: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('role');
            console.log('Logout successful');
        },
        onError: (error) => {
            console.error('Logout error:', error);
            throw new Error('Logout failed');
        }
    });
}