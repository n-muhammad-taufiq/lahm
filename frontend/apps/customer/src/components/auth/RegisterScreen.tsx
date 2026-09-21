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

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
  onBackToWelcome?: () => void;
  onRegisterSuccess?: () => void;
}

export function RegisterScreen({
  onSwitchToLogin,
  onBackToWelcome,
  onRegisterSuccess,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = () => {
    setErrorMessage('');
    if (!name.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    setLoading(true);
    // Simulate register action
    setTimeout(() => {
      setLoading(false);
      if (onRegisterSuccess) {
        onRegisterSuccess();
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
        <Text style={styles.title}>Join Lahm</Text>
        <Text style={styles.subtitle}>Create your customer account to start ordering fresh meat</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#A1A1AA"
            value={name}
            onChangeText={setName}
          />
        </View>

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
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+971 50 123 4567"
            placeholderTextColor="#A1A1AA"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="At least 8 characters"
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
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.loginLink}>Log In</Text>
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
    gap: 14,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181B',
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
  termsText: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  linkText: {
    color: '#18181B',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#71717A',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
    textDecorationLine: 'underline',
  },
});
