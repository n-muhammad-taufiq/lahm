/**
 * StoreLocationMapPreview Component
 * 
 * Reusable mini-map preview card matching Lahm's visual design:
 * - 144dp height with 16dp rounded corners
 * - Styled Leaflet map tiles
 * - Centered artisanal terracotta teardrop pin marker with white center dot
 * - Floating bottom pill badge with address & monospace GPS coordinates
 * - Fallback dashed empty state with pin action
 * - Cross-platform (Web iframe & Native WebView)
 */

import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { StoreLocationMapPreviewProps } from './StoreLocationMapPreview.types';

function getMiniMapHtml(lat: number, lon: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #e5e5e5; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([${lat}, ${lon}], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
  </script>
</body>
</html>`;
}

export const StoreLocationMapPreview: React.FC<StoreLocationMapPreviewProps> = ({
  latitude,
  longitude,
  addressText,
  onPress,
  className = '',
  style,
  testID,
}) => {
  // If coordinates are not yet available, show clean interactive map placeholder card
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Pin storefront location on map"
        testID={testID}
        className={`w-full h-36 rounded-md border border-dashed border-zinc-300 bg-zinc-50 items-center justify-center mt-2 px-4 shadow-xs ${className}`}
        style={style}>
        <View className="w-10 h-10 rounded-full bg-red-50 border border-red-200 items-center justify-center mb-1.5">
          <Text className="text-base">📍</Text>
        </View>
        <Text className="text-xs font-semibold text-zinc-800">Pin Storefront Location</Text>
        <Text className="text-[11px] text-zinc-500 text-center mt-0.5">
          Tap to open map and set your shop coordinates
        </Text>
      </TouchableOpacity>
    );
  }

  const htmlContent = getMiniMapHtml(latitude, longitude);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Storefront location map preview for ${addressText || 'location'}`}
      testID={testID}
      className={`w-full h-36 rounded-md border border-zinc-200 overflow-hidden relative bg-zinc-100 mt-2 shadow-xs ${className}`}
      style={style}>
      {/* Map Tile Layer: OpenStreetMap via iframe on web, WebView on native */}
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
          title="Storefront Location Map Preview"
        />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          pointerEvents="none"
          scrollEnabled={false}
          style={{ flex: 1, backgroundColor: '#f4f4f5' }}
        />
      )}

      {/* Center Pin matching screenshot (teardrop with white dot & pointer) */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ zIndex: 10, marginTop: -14 }}>
        <View className="items-center justify-center">
          <View className="w-6 h-6 rounded-full bg-brand-terracotta border-2 border-white items-center justify-center shadow-md">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 5,
              borderRightWidth: 5,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#B04A37',
              marginTop: -2,
            }}
          />
          <View className="w-2.5 h-1 rounded-full bg-black/25 mt-0.5" />
        </View>
      </View>

      {/* Floating Bottom Pill with rounded-md and mono coordinates */}
      <View
        className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 rounded-md border border-zinc-200/90 shadow-sm px-3 py-1.5 flex-row items-center justify-between"
        style={{ zIndex: 15 }}>
        <Text className="text-xs font-medium text-zinc-800 flex-1 mr-2" numberOfLines={1}>
          {addressText || 'Storefront Location'}
        </Text>
        <Text className="text-[10px] font-mono text-zinc-500">
          {`${latitude.toFixed(4)}°N • ${longitude.toFixed(4)}°E`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

