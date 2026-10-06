import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  searchAddressSuggestions,
  reverseGeocodeCoords,
  getCurrentDevicePosition,
  type AddressSuggestion,
} from '../services/locationSearchService';

export interface StoreLocationMapModalProps {
  visible: boolean;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onClose: () => void;
  onConfirmLocation: (location: {
    latitude: number;
    longitude: number;
    addressSuggestion?: AddressSuggestion | null;
  }) => void;
}

// Generate self-contained Leaflet OpenStreetMap HTML bundle
function getLeafletMapHtml(lat: number, lon: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #f4f4f5; }
    .leaflet-control-attribution { font-size: 9px !important; background: rgba(255,255,255,0.7) !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${lat}, ${lon}], 17);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '© OpenStreetMap, © CARTO'
    }).addTo(map);

    function sendCenter() {
      var center = map.getCenter();
      var message = JSON.stringify({
        type: 'CENTER_CHANGED',
        lat: Number(center.lat.toFixed(6)),
        lon: Number(center.lng.toFixed(6))
      });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(message);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(message, '*');
      }
    }

    map.on('moveend', sendCenter);

    // Listen for center commands from React Native
    function handlePanMessage(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'PAN_TO' && typeof data.lat === 'number' && typeof data.lon === 'number') {
          map.setView([data.lat, data.lon], 17, { animate: true });
        }
      } catch (e) {}
    }

    window.addEventListener('message', handlePanMessage);
    document.addEventListener('message', handlePanMessage);
  </script>
</body>
</html>`;
}

export function StoreLocationMapModal({
  visible,
  initialLatitude,
  initialLongitude,
  onClose,
  onConfirmLocation,
}: StoreLocationMapModalProps) {
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  const initialCoordsRef = useRef<{ latitude: number; longitude: number } | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  const [resolvedAddress, setResolvedAddress] = useState<AddressSuggestion | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Top Search Bar & Autocomplete State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<any>(null);
  const reverseGeocodeTimer = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAddress = useCallback(async (lat: number, lon: number) => {
    setIsGeocoding(true);
    setErrorMessage(null);
    try {
      const result = await reverseGeocodeCoords(lat, lon);
      setResolvedAddress(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resolve address details for this location.');
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const panMapToCoords = useCallback((lat: number, lon: number) => {
    const panMessage = JSON.stringify({
      type: 'PAN_TO',
      lat,
      lon,
    });

    if (webViewRef.current) {
      webViewRef.current.postMessage(panMessage);
    }

    if (Platform.OS === 'web' && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(panMessage, '*');
    }
  }, []);

  // Sync coords when modal opens with new initial coordinates or auto-locate by default
  useEffect(() => {
    if (visible) {
      if (initialLatitude && initialLongitude) {
        const coords = { latitude: initialLatitude, longitude: initialLongitude };
        setCurrentCoords(coords);
        if (!initialCoordsRef.current) {
          initialCoordsRef.current = coords;
        }
        panMapToCoords(initialLatitude, initialLongitude);
        fetchAddress(initialLatitude, initialLongitude);
      } else {
        // Automatically acquire accurate device GPS location
        handleLocateMe();
      }
    }
  }, [visible, initialLatitude, initialLongitude, fetchAddress, panMapToCoords]);

  // Debounced address search
  useEffect(() => {
    const trimmed = searchQuery.trim();
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
        setIsDropdownOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSearchError(err.message || 'Unable to fetch address suggestions.');
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
  }, [searchQuery]);

  // When user taps a suggestion in the dropdown
  const handleSelectSuggestion = useCallback(
    (item: AddressSuggestion) => {
      setSearchQuery(item.title);
      setSuggestions([]);
      setIsDropdownOpen(false);
      setSearchError(null);
      setResolvedAddress(item);
      const coords = { latitude: item.latitude, longitude: item.longitude };
      setCurrentCoords(coords);
      if (!initialCoordsRef.current) {
        initialCoordsRef.current = coords;
      }

      // Pan map directly to selected coordinates
      panMapToCoords(item.latitude, item.longitude);
    },
    [panMapToCoords]
  );

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const rawData =
          typeof event.nativeEvent?.data === 'string'
            ? event.nativeEvent.data
            : typeof event.data === 'string'
            ? event.data
            : null;

        if (!rawData) return;
        const data = JSON.parse(rawData);

        if (data.type === 'CENTER_CHANGED' && typeof data.lat === 'number' && typeof data.lon === 'number') {
          setCurrentCoords({ latitude: data.lat, longitude: data.lon });

          // Debounce reverse geocoding on user pan
          if (reverseGeocodeTimer.current) {
            clearTimeout(reverseGeocodeTimer.current);
          }
          reverseGeocodeTimer.current = setTimeout(() => {
            fetchAddress(data.lat, data.lon);
          }, 400);
        }
      } catch (e) {
        // Non-JSON message, ignore
      }
    },
    [fetchAddress]
  );

  // Web iframe message listener fallback
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const listener = (event: MessageEvent) => {
        handleMessage(event);
      };
      window.addEventListener('message', listener);
      return () => {
        window.removeEventListener('message', listener);
      };
    }
  }, [handleMessage]);

  const handleLocateMe = async () => {
    setIsLocatingGPS(true);
    setErrorMessage(null);
    try {
      const position = await getCurrentDevicePosition();
      const coords = {
        latitude: position.latitude,
        longitude: position.longitude,
      };
      setCurrentCoords(coords);
      if (!initialCoordsRef.current) {
        initialCoordsRef.current = coords;
      }

      panMapToCoords(position.latitude, position.longitude);
      fetchAddress(position.latitude, position.longitude);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not retrieve device GPS location.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  const handleConfirm = () => {
    if (!currentCoords) return;
    onConfirmLocation({
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      addressSuggestion: resolvedAddress,
    });
    onClose();
  };

  if (!visible) return null;

  const mapCenter = initialCoordsRef.current || currentCoords;
  const htmlContent = mapCenter ? getLeafletMapHtml(mapCenter.latitude, mapCenter.longitude) : '';
  const showDropdown = isDropdownOpen && (suggestions.length > 0 || isSearching || Boolean(searchError));

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white relative" edges={['top', 'bottom']}>
        {/* 1. Top Floating Search Header Bar */}
        <View className="px-4 pt-2 pb-2 bg-white border-b border-zinc-200 z-50">
          <View className="flex-row items-center gap-2">
            {/* Back Button */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Back to registration"
              className="w-10 h-10 rounded-full border border-zinc-200 bg-white items-center justify-center active:bg-zinc-50 shadow-sm">
              <Text className="text-zinc-700 text-lg font-semibold leading-none mb-0.5">‹</Text>
            </TouchableOpacity>

            {/* Top Search Input Box */}
            <View
              style={{
                flex: 1,
                height: 48,
                minHeight: 48,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E4E4E7',
                backgroundColor: '#FFFFFF',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
              }}>
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0 || searchQuery.trim().length >= 2) {
                    setIsDropdownOpen(true);
                  }
                }}
                placeholder="Search area, street, or landmark..."
                placeholderTextColor="#A1A1AA"
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#18181B',
                  height: '100%',
                  paddingVertical: 0,
                  ...(Platform.OS === 'web'
                    ? ({ outline: 'none', border: 'none', backgroundColor: 'transparent' } as any)
                    : {}),
                }}
                returnKeyType="search"
                autoCorrect={false}
              />

              {isSearching ? (
                <ActivityIndicator size="small" color="#B04A37" />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setIsDropdownOpen(false);
                    setSearchError(null);
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel="Clear search input"
                  className="w-6 h-6 rounded-full bg-zinc-100 items-center justify-center">
                  <Text className="text-zinc-500 text-xs font-bold leading-none">✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Autocomplete Dropdown Sheet: closes immediately on select */}
          {showDropdown ? (
            <View className="w-full bg-white rounded-md border border-zinc-200 shadow-lg mt-2 overflow-hidden z-50">
              {isSearching && suggestions.length === 0 ? (
                <View className="p-3.5 flex-row items-center justify-center gap-2">
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

        {/* 2. Map Container Viewport */}
        <View className="flex-1 relative bg-zinc-100 overflow-hidden">
          {!mapCenter ? (
            <View className="flex-1 items-center justify-center p-6 bg-zinc-50">
              {isLocatingGPS ? (
                <>
                  <ActivityIndicator size="large" color="#B04A37" />
                  <Text className="text-sm font-semibold text-zinc-800 mt-3">
                    Acquiring device GPS location...
                  </Text>
                  <Text className="text-xs text-zinc-500 text-center mt-1">
                    Please allow location permissions on your device
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-3xl mb-2">📍</Text>
                  <Text className="text-sm font-semibold text-zinc-800 text-center">
                    {errorMessage || 'Location not detected'}
                  </Text>
                  <Text className="text-xs text-zinc-500 text-center mt-1 max-w-[280px]">
                    Search for your area or street above to position your shop pin
                  </Text>
                  <TouchableOpacity
                    onPress={handleLocateMe}
                    activeOpacity={0.8}
                    className="mt-4 px-4 py-2.5 rounded-md bg-[#B04A37]">
                    <Text className="text-xs font-semibold text-white">Retry Device GPS</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <>
              {Platform.OS === 'web' ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Store Location Map"
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  onMessage={handleMessage}
                  style={{ flex: 1, backgroundColor: '#f4f4f5' }}
                  javaScriptEnabled
                  domStorageEnabled
                />
              )}

              {/* Center Pin Overlay (Fixed at exact viewport center) */}
              <View
                pointerEvents="none"
                className="absolute inset-0 items-center justify-center"
                style={{ zIndex: 20 }}>
                {/* Store Entrance Tag */}
                <View className="px-2.5 py-1 rounded-sm bg-white border border-zinc-200 shadow-sm mb-1">
                  <Text className="text-[11px] font-semibold text-[#B04A37]">
                    Shop Entrance Pin
                  </Text>
                </View>

                {/* Custom Terracotta Needle Pin */}
                <View className="items-center justify-center">
                  <View className="w-8 h-8 rounded-full bg-[#B04A37] border-2 border-white items-center justify-center shadow-md">
                    <View className="w-2.5 h-2.5 rounded-full bg-white" />
                  </View>
                  {/* Needle tip pointer */}
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      backgroundColor: 'transparent',
                      borderStyle: 'solid',
                      borderLeftWidth: 6,
                      borderRightWidth: 6,
                      borderTopWidth: 10,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: '#B04A37',
                      marginTop: -2,
                    }}
                  />
                  {/* Ground target ring shadow */}
                  <View className="w-3 h-1.5 rounded-full bg-black/25 mt-0.5" />
                </View>
              </View>
            </>
          )}

          {/* Floating "Locate Me" GPS Button */}
          <TouchableOpacity
            onPress={handleLocateMe}
            disabled={isLocatingGPS}
            activeOpacity={0.8}
            className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-lg items-center justify-center active:bg-zinc-50 z-30">
            {isLocatingGPS ? (
              <ActivityIndicator size="small" color="#B04A37" />
            ) : (
              <Text className="text-lg leading-none">📍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. Bottom Location Confirmation Sheet */}
        <View className="px-5 py-4 bg-white border-t border-zinc-200 z-10 max-w-[480px] w-full self-center">
          {/* Resolved Address / Locality Information */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                SELECTED STOREFRONT PIN
              </Text>
              <View className="px-2 py-0.5 rounded-sm bg-zinc-100 border border-zinc-200">
                <Text className="text-[11px] font-mono font-medium text-zinc-700">
                  {currentCoords
                    ? `${currentCoords.latitude.toFixed(4)}° N, ${currentCoords.longitude.toFixed(4)}° E`
                    : 'Coordinates Pending'}
                </Text>
              </View>
            </View>

            {isGeocoding ? (
              <View className="flex-row items-center gap-2 py-1">
                <ActivityIndicator size="small" color="#B04A37" />
                <Text className="text-xs text-zinc-500">Resolving street details...</Text>
              </View>
            ) : errorMessage ? (
              <View className="flex-row items-center gap-1.5 py-1">
                <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
                <Text className="text-xs text-red-500 font-normal flex-1" numberOfLines={1}>
                  {errorMessage}
                </Text>
              </View>
            ) : resolvedAddress ? (
              <View>
                <Text className="text-sm font-bold text-zinc-900" numberOfLines={1}>
                  {resolvedAddress.title}
                </Text>
                {resolvedAddress.subtitle ? (
                  <Text className="text-xs text-zinc-500 mt-0.5" numberOfLines={1}>
                    {resolvedAddress.subtitle}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="text-xs text-zinc-500 py-1">
                Pan the map to position your shop's pickup entrance.
              </Text>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!currentCoords}
            activeOpacity={0.8}
            className={`w-full h-12 rounded-md items-center justify-center ${
              currentCoords ? 'bg-[#B04A37] active:bg-[#963C2C]' : 'bg-zinc-300'
            }`}>
            <Text className="text-[15px] font-bold text-white tracking-wide">
              Confirm Store Location
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
