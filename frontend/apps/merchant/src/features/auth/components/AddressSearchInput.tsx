import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import {
  searchAddressSuggestions,
  getResolvedCurrentLocation,
  type AddressSuggestion,
} from '../services/locationSearchService';

export interface AddressSearchInputProps {
  onSelectAddress: (suggestion: AddressSuggestion) => void;
  onError?: (errorMessage: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressSearchInput({
  onSelectAddress,
  onError,
  placeholder = 'Search shop address, area, or landmark...',
  disabled = false,
}: AddressSearchInputProps) {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchAddressSuggestions(
          trimmed,
          abortControllerRef.current.signal
        );
        setSuggestions(results);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const msg = err.message || 'Unable to fetch address suggestions.';
          setSearchError(msg);
          onError?.(msg);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, onError]);

  const handleSelectSuggestion = useCallback(
    (item: AddressSuggestion) => {
      setQuery(item.title);
      setIsOpen(false);
      setSuggestions([]);
      setSearchError(null);
      onSelectAddress(item);
    },
    [onSelectAddress]
  );

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setSearchError(null);

    try {
      const resolved = await getResolvedCurrentLocation();
      setQuery(resolved.title || resolved.shopAddress);
      setIsOpen(false);
      setSuggestions([]);
      onSelectAddress(resolved);
    } catch (err: any) {
      const msg = err.message || 'Could not retrieve device location.';
      setSearchError(msg);
      onError?.(msg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSearchError(null);
  };

  const showDropdown = isOpen && (suggestions.length > 0 || isSearching || Boolean(searchError));

  return (
    <View className="w-full gap-1.5 z-20">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-medium text-zinc-800">
          Find Shop Location <Text className="text-[#B04A37]">*</Text>
        </Text>
        <Text className="text-xs text-zinc-400">Search area or use GPS</Text>
      </View>

      {/* Input container */}
      <View
        className={`h-13 rounded-md border bg-white flex-row items-center px-4 transition-all ${
          isFocused ? 'border-zinc-400 ring-1 ring-zinc-300' : 'border-zinc-200'
        }`}>
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0 || query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing slightly so user can tap suggestions
            setTimeout(() => {
              setIsOpen(false);
            }, 250);
          }}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          editable={!disabled && !isLocating}
          className="flex-1 text-[15px] text-zinc-900 font-normal py-0 h-full"
          style={{
            fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          }}
          returnKeyType="search"
          autoCorrect={false}
        />

        {/* Right Action Icons: Spinner / Clear */}
        <View className="flex-row items-center gap-2 ml-2">
          {isSearching ? (
            <ActivityIndicator size="small" color="#B04A37" />
          ) : query.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.7}
              accessibilityLabel="Clear search input"
              className="w-6 h-6 rounded-full bg-zinc-100 items-center justify-center">
              <Text className="text-zinc-500 text-xs font-bold leading-none">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 1-Tap "Use Current Location" Shortcut Pill */}
      <TouchableOpacity
        onPress={handleUseCurrentLocation}
        disabled={isLocating || disabled}
        activeOpacity={0.7}
        className="self-start mt-0.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 active:bg-zinc-100 flex-row items-center gap-1.5">
        {isLocating ? (
          <>
            <ActivityIndicator size="small" color="#B04A37" />
            <Text className="text-xs font-semibold text-[#B04A37]">Locating storefront GPS...</Text>
          </>
        ) : (
          <>
            <Text className="text-xs font-semibold text-zinc-700">Use Current GPS Location</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Autocomplete Suggestions Dropdown Sheet */}
      {showDropdown ? (
        <View className="w-full bg-white rounded-md border border-zinc-200 shadow-md mt-1 overflow-hidden z-30">
          {isSearching && suggestions.length === 0 ? (
            <View className="p-4 flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#B04A37" />
              <Text className="text-xs text-zinc-500">Searching address suggestions...</Text>
            </View>
          ) : null}

          {searchError ? (
            <View className="p-3 bg-[#FFF5F5] border-b border-red-100 flex-row items-center gap-1.5">
              <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
              <Text className="text-xs text-red-600 flex-1">{searchError}</Text>
            </View>
          ) : null}

          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={item.id || `${item.latitude}-${item.longitude}-${idx}`}
              onPress={() => handleSelectSuggestion(item)}
              activeOpacity={0.7}
              className={`px-4 py-3 flex-col justify-center active:bg-zinc-50 ${
                idx < suggestions.length - 1 ? 'border-b border-zinc-100' : ''
              }`}>
              <Text className="text-sm font-semibold text-zinc-900" numberOfLines={1}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text className="text-xs text-zinc-500 mt-0.5" numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
