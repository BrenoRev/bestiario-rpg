import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const keys = {
  universes: ["universes"] as const,
  universe: (id: string) => ["universe", id] as const,
  creatures: (universeId: string) => ["creatures", universeId] as const,
  creature: (id: string) => ["creature", id] as const,
  images: (creatureId: string) => ["creature-images", creatureId] as const,
  profile: ["profile"] as const,
  signed: (path: string) => ["signed", path] as const,
};

export function useUniverses() {
  const { user } = useAuth();
  return useQuery({ queryKey: keys.universes, queryFn: api.listUniverses, enabled: !!user });
}

export function useUniverse(id: string | undefined) {
  return useQuery({ queryKey: keys.universe(id ?? ""), queryFn: () => api.getUniverse(id!), enabled: !!id });
}

export function useCreatures(universeId: string | undefined) {
  return useQuery({
    queryKey: keys.creatures(universeId ?? ""),
    queryFn: () => api.listCreatures(universeId!),
    enabled: !!universeId,
  });
}

export function useCreature(id: string | undefined) {
  return useQuery({ queryKey: keys.creature(id ?? ""), queryFn: () => api.getCreature(id!), enabled: !!id });
}

export function useCreatureImages(creatureId: string | null | undefined) {
  return useQuery({
    queryKey: keys.images(creatureId ?? ""),
    queryFn: () => api.listCreatureImages(creatureId!),
    enabled: !!creatureId,
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({ queryKey: keys.profile, queryFn: api.getProfile, enabled: !!user });
}

export function useSignedUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: keys.signed(path ?? ""),
    queryFn: () => api.signedUrl(path!),
    enabled: !!path,
    staleTime: 45 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    retry: 1,
  });
}
