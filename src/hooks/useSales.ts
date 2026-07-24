import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from 'shared';
import type { SaleWithCustomer } from 'shared';
import type { CreateSaleInput } from 'shared';

export const useSalesQuery = (shopId: string | undefined) => {
  return useQuery<SaleWithCustomer[]>({
    queryKey: ['sales', 'list', shopId],
    queryFn: () => (shopId ? saleService.getSales(shopId) : []),
    enabled: !!shopId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCustomerBalanceQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', 'balance', customerId],
    queryFn: () => (customerId ? saleService.getCustomerBalance(customerId) : { total_sales: 0, total_payments: 0, outstanding_credit: 0 }),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCustomerLedgerQuery = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', 'ledger', customerId],
    queryFn: () => (customerId ? saleService.getCustomerLedger(customerId) : { sales: [], payments: [] }),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => saleService.createSale(input),
    onSuccess: (data, variables) => {
      // Invalidate sales lists
      queryClient.invalidateQueries({ queryKey: ['sales', 'list', variables.shop_id] });
      // Invalidate specific customer balance and ledger
      queryClient.invalidateQueries({ queryKey: ['customers', 'balance', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'ledger', variables.customer_id] });
      // Invalidate dashboard summaries
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics', variables.shop_id] });
    },
  });
};

export const useDeleteSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId }: { saleId: string; customerId: string; shopId: string }) =>
      saleService.deleteSale(saleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'list', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'balance', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'ledger', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics', variables.shopId] });
    },
  });
};
