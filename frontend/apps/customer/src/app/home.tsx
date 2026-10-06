/**
 * Home Route Screen
 * 
 * Main landing route for logged-in customers. It loads and renders
 * the CustomerHomeScreen dashboard showing delivery address and meat categories.
 */

import React from 'react';
import { CustomerHomeScreen } from '../features/home';

export default function HomeRoute() {
  return <CustomerHomeScreen />;
}
