"use client";

import { useState, useEffect } from "react";

export function useGames(category) {
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch providers and check their game counts
  useEffect(() => {
    const fetchProvidersAndGames = async () => {
      try {
        setInitialLoading(true);
        // First fetch all providers
        const providersResponse = await fetch("/api/game/providers");
        const providersData = await providersResponse.json();

        if (!providersData.data) {
          throw new Error("No providers found");
        }

        // For each provider, fetch games to check if they have any in the selected category
        const providersWithGames = await Promise.all(
          providersData.data.map(async (provider) => {
            const gamesResponse = await fetch(
              `/api/game/games?provider_id=${provider.provider_id}&category=${category}`
            );
            const gamesData = await gamesResponse.json();
            return {
              ...provider,
              hasGames: (gamesData.data || []).length > 0,
            };
          })
        );

        // Filter providers that have games
        const activeProviders = providersWithGames.filter((p) => p.hasGames);

        if (activeProviders.length > 0) {
          setProviders(activeProviders);
          setSelectedProvider(activeProviders[0].provider_id);
        } else {
          setError("No providers with games available");
        }
      } catch (err) {
        setError("Failed to load providers");
        console.error("Error fetching providers:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProvidersAndGames();
  }, [category]);

  // Fetch games when provider changes
  useEffect(() => {
    const fetchGames = async () => {
      if (!selectedProvider) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/game/games?provider_id=${selectedProvider}&category=${category}`
        );
        const data = await response.json();
        if (data.data) {
          setGames(data.data);
        }
      } catch (err) {
        setError("Failed to load games");
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedProvider, category]);

  return {
    games,
    providers,
    selectedProvider,
    setSelectedProvider,
    loading: loading || initialLoading,
    error,
  };
}
