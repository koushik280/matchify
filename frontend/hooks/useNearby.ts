// hooks/useNearby.ts
import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { fetchNearbyUsers, updateUserLocation, swipeOnUser } from '@/api/nearby';
import type { NearbyUser } from '@/api/nearby';
import toast from 'react-hot-toast';

export function useNearby() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [radius, setRadius] = useState(10);
  const hasLocation = !!user?.location?.coordinates;

  // Query for nearby users – includes radius in queryKey
  const {
    data: candidates = [],
    isLoading,
    error,
    refetch,
  } = useQuery<NearbyUser[]>({
    queryKey: ['nearby', user?.location?.coordinates, radius],
    queryFn: () => fetchNearbyUsers(radius),
    enabled: hasLocation,
    staleTime: 5 * 60 * 1000,
  });

  const currentCandidate = candidates[0] || null;

  const locationMutation = useMutation({
    mutationFn: ({ longitude, latitude }: { longitude: number; latitude: number }) =>
      updateUserLocation(longitude, latitude),
    onSuccess: (res) => {
      if (res.user) updateUser(res.user);
      toast.success('Location updated! Fetching nearby users...');
      refetch();
    },
    onError: (err: AxiosError) => {
      toast.error('Failed to save location. Please try again.');
      console.error(err);
    },
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetUserId, type }: { targetUserId: string; type: 'like' | 'pass' }) =>
      swipeOnUser(targetUserId, type),
    onSuccess: (data, variables) => {
      if (data.isMutual) {
        const target = candidates.find(c => c._id === variables.targetUserId);
        if (target) toast.success(`You matched with ${target.name}!`);
      }
      queryClient.setQueryData<NearbyUser[]>(['nearby', user?.location?.coordinates, radius], (old) =>
        old ? old.filter(c => c._id !== variables.targetUserId) : old
      );
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 409) {
        toast.error('You already swiped on this person');
      } else {
        toast.error('Swipe failed. Please try again.');
      }
    },
  });

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        locationMutation.mutate({ longitude, latitude });
      },
      () => {
        toast.error('Unable to get your location. Please enable permissions.');
      }
    );
  }, [locationMutation]);

  const swipe = useCallback((direction: 'left' | 'right') => {
    if (!candidates.length) return;
    const target = candidates[0];
    const type = direction === 'right' ? 'like' : 'pass';
    swipeMutation.mutate({ targetUserId: target._id, type });
  }, [candidates, swipeMutation]);

  const fetchNearby = useCallback((newRadius?: number) => {
    if (newRadius !== undefined) setRadius(newRadius);
    else refetch();
  }, [refetch]);

  return {
    candidates,
    currentCandidate,
    isLoading,
    hasLocation,
    error: error ? error.message : null,  // convert Error to string message
    updateLocation,
    swipe,
    fetchNearby,
    isUpdatingLocation: locationMutation.isPending,
    isSwiping: swipeMutation.isPending,
  };
}