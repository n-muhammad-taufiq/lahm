import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
  onBackToWelcome?: () => void;
  onLoginSuccess?: () => void;
}

export function LoginScreen({
  onSwitchToRegister,
  onBackToWelcome,
  onLoginSuccess,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    setLoading(true);
    // Simulate login action
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        {onBackToWelcome && (
          <TouchableOpacity onPress={onBackToWelcome} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LAHM لحم</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your account details to continue</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#A1A1AA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onSwitchToRegister}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F4F4F5',
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
  },
  titleSection: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
  },
  form: {
    gap: 16,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
  },
  inputContainer: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181B',
  },
  forgotText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#18181B',
    backgroundColor: '#FFFFFF',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  eyeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#18181B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#A1A1AA',
  },
  socialButton: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#71717A',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
    textDecorationLine: 'underline',
  },
});
