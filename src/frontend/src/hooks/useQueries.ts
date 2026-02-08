import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, TableView } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Matchmaking Queries
export function useGetQueueSize() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['queueSize'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getQueueSize();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 2000, // Poll every 2 seconds while matchmaking
  });
}

export function useJoinQueue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinQueue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueSize'] });
      queryClient.invalidateQueries({ queryKey: ['currentTable'] });
    },
  });
}

// Table Queries
export function useGetTable() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TableView | null>({
    queryKey: ['currentTable'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTable();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 3000, // Poll every 3 seconds during game
  });
}

export function usePerformAction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.performAction(action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTable'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Game Settings Query
export function useGetGameSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['gameSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGameSettings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}
