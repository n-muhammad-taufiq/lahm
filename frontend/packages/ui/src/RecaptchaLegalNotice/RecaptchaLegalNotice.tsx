/**
 * reCAPTCHA Legal Notice Component
 * 
 * Footer disclaimer displaying Google reCAPTCHA terms, privacy policy links,
 * and security badge icons for compliance.
 */

import React from 'react';
import {
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface RecaptchaLegalNoticeProps {
  /** Optional custom Tailwind classes */
  className?: string;
  /** Optional inline style override */
  style?: StyleProp<ViewStyle>;
  /** Whether to show a minimalist Google / security shield badge icon (default: true) */
  showShield?: boolean;
}

/**
 * Minimalist reCAPTCHA shield icon
 */
function ShieldIcon() {
  return (
    <View style={styles.shieldContainer}>
      <Text style={styles.shieldEmoji}>🛡️</Text>
    </View>
  );
}

/**
 * Official Google reCAPTCHA Legal Compliance Notice
 * Mandated by Google's Terms of Service for Invisible reCAPTCHA implementations:
 * "This site/app is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply."
 */
export const RecaptchaLegalNotice: React.FC<RecaptchaLegalNoticeProps> = ({
  className = '',
  style,
  showShield = false,
}) => {
  const handleOpenPrivacy = () => {
    Linking.openURL('https://policies.google.com/privacy').catch(() => {});
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://policies.google.com/terms').catch(() => {});
  };

  return (
    <View
      style={[styles.container, style]}
      className={`items-center justify-center py-2 px-4 ${className}`}>
      <View style={styles.contentRow}>
        {showShield && <ShieldIcon />}
        <Text style={styles.noticeText} className="text-center text-[11px] text-[#A8988F] leading-4">
          This app is protected by reCAPTCHA and the Google{' '}
          <Text
            onPress={handleOpenPrivacy}
            style={styles.linkText}
            className="text-[#E77A62] underline font-medium">
            Privacy Policy
          </Text>
          {' '}and{' '}
          <Text
            onPress={handleOpenTerms}
            style={styles.linkText}
            className="text-[#E77A62] underline font-medium">
            Terms of Service
          </Text>
          {' '}apply.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  shieldContainer: {
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldEmoji: {
    fontSize: 10,
  },
  noticeText: {
    fontSize: 11,
    color: '#A8988F',
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: '#E77A62',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
