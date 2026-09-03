"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    hamlet?: string;
    suburb?: string;
    municipality?: string;
    county?: string;
  };
};

const searchCache = new Map<string, NominatimResult[]>();

interface LocalitySearchFieldProps {
  /** Nombre del municipio seleccionado para contextualizar la búsqueda */
  municipality: string;
  /** Valor actual del campo localidad */
  value: string;
  /** Callback cuando el usuario escribe (solo texto) */
  onChangeText: (text: string) => void;
  /** Callback cuando el usuario selecciona un resultado de la lista */
  onSelect: (locality: string, address: string, latitude: number, longitude: number) => void;
  placeholder?: string;
}

/**
 * Campo de texto con autocompletado de localidades usando Nominatim (OpenStreetMap).
 * Al seleccionar un resultado, se rellenan localidad, dirección y coordenadas.
 */
export function LocalitySearchField({
  municipality,
  value,
  onChangeText,
  onSelect,
  placeholder = "Escribe el nombre de la localidad o comunidad",
}: LocalitySearchFieldProps) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const term = `${query.trim()}, ${municipality}, Tabasco, México`;
    setSearching(true);
    setSearchError(null);
    try {
      let data = searchCache.get(term);
      if (!data) {
        const params = new URLSearchParams({
          q: term,
          format: "jsonv2",
          addressdetails: "1",
          limit: "6",
          countrycodes: "mx",
          viewbox: "-94.2,18.7,-90.9,17.2",
          bounded: "1",
          "accept-language": "es",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
        );
        if (!response.ok) throw new Error("No fue posible consultar el buscador de localidades");
        data = await response.json();
        searchCache.set(term, data ?? []);
      }
      setResults(data ?? []);
      setShowResults(true);
      if (!data?.length) {
        setSearchError(`No se encontraron localidades con ese nombre en ${municipality}, Tabasco.`);
      }
    } catch (cause) {
      setSearchError(cause instanceof Error ? cause.message : "Error de búsqueda");
      setResults([]);
      setShowResults(false);
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (text: string) => {
    onChangeText(text);
    setShowResults(false);
    setSearchError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 500);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = Number(result.lat);
    const lon = Number(result.lon);
    const localityName =
      result.address?.village ||
      result.address?.town ||
      result.address?.hamlet ||
      result.address?.suburb ||
      result.address?.city ||
      value.trim();
    onChangeText(localityName);
    onSelect(localityName, result.display_name, lat, lon);
    setResults([]);
    setShowResults(false);
    setSearchError(null);
  };

  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            value={value}
            onChangeText={handleChange}
            placeholder={placeholder}
            onSubmitEditing={() => doSearch(value)}
          />
        </View>
        <Button
          variant="outline"
          onPress={() => doSearch(value)}
          disabled={searching || !value.trim()}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#981646" />
          ) : (
            <Text>Buscar</Text>
          )}
        </Button>
      </View>

      {searchError && !showResults ? (
        <Text className="text-xs text-destructive">{searchError}</Text>
      ) : null}

      {showResults && results.length > 0 ? (
        <View
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          style={{ zIndex: 50 }}
        >
          {results.map((result) => (
            <Button
              key={result.place_id}
              variant="ghost"
              className="h-auto justify-start border-b border-border px-4 py-3"
              onPress={() => handleSelect(result)}
            >
              <View>
                <Text className="text-left text-sm font-semibold">
                  {result.address?.village ||
                    result.address?.town ||
                    result.address?.hamlet ||
                    result.address?.suburb ||
                    result.address?.city ||
                    result.display_name.split(",")[0]}
                </Text>
                <Text className="mt-0.5 text-left text-xs text-muted-foreground">
                  {result.display_name}
                </Text>
              </View>
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  );
}
