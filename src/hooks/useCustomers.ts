import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from 'shared';
import type { CreateCustomerInput, UpdateCustomerInput } from 'shared';

export const useCustomersQuery = (shopId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', 'list', shopId],
    queryFn: () => (shopId ? customerService.getCustomers(shopId) : []),
    enabled: !!shopId,
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
};

export const useCustomerDetailQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', 'detail', customerId],
    queryFn: () => (customerId ? customerService.getCustomerById(customerId) : null),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerService.createCustomer(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list', variables.shop_id] });
    },
  });
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId: string; input: UpdateCustomerInput; shopId: string }) =>
      customerService.updateCustomer(customerId, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', data.id] });
    },
  });
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId }: { customerId: string; shopId: string }) =>
      customerService.deleteCustomer(customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', variables.customerId] });
    },
  });
};
