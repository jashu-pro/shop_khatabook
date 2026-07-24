import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from 'shared';
import type { CreateShopInput } from 'shared';

export const useShopQuery = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: ['shop', ownerId],
    queryFn: () => (ownerId ? shopService.getShopByOwner(ownerId) : null),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useCreateShopMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shopData: CreateShopInput) => shopService.createShop(shopData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shop', data.owner_id] });
    },
  });
};
