import { usePhoneAuthFlow as useSharedPhoneAuthFlow } from '@lahm/api';

/**
 * Customer Phone Authentication Hook
 * Delegates to the unified hook in @lahm/api configured with role: 'customer'
 */
export function usePhoneAuthFlow() {
  return useSharedPhoneAuthFlow({
    role: 'customer',
    requireRegistrationDetails: true,
  });
}
