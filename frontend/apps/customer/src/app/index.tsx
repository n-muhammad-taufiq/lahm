/**
 * Customer App Root Route
 * 
 * Default landing screen for customers opening the Lahm app.
 * Renders the CustomerHomeScreen dashboard directly without blocking on login.
 */

import React from 'react';
import { CustomerHomeScreen } from '../features/home';

export default function RootRoute() {
  return <CustomerHomeScreen />;
}

