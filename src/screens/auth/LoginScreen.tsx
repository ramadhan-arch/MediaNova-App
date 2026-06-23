import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk Show/Hide
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi!');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>MEDIANOVA</Text>
        
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your credentials to access your creator studio.</Text>

          {/* Email Input */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.inputLight}
            placeholder="name@domain.com"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Text style={[styles.label, styles.marginTop]}>PASSWORD</Text>
          <View style={styles.passwordContainerLight}>
            <TextInput
              style={styles.passwordInputLight}
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // Toggle privasi
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeTextLight}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginText}>Login</Text>
            }
          </TouchableOpacity>

          {/* Navigation to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>OR CONTINUE WITH </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { 
    fontSize: 28, 
    fontWeight: '900', 
    fontStyle: 'italic',
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 20,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1C1C24',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#A0A0AB', textAlign: 'center', marginBottom: 32 },
  label: {
    color: '#E0E0E0',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  marginTop: { marginTop: 16 },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    color: '#000',
    fontSize: 15,
  },
  // Style baru untuk container password
  passwordContainerLight: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInputLight: {
    flex: 1,
    paddingVertical: 16,
    color: '#000',
    fontSize: 15,
  },
  eyeButton: { padding: 4 },
  eyeTextLight: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forgotText: { 
    color: '#E91E63', 
    fontSize: 11, 
    fontWeight: 'bold',
    alignSelf: 'flex-end', 
    marginTop: 10, 
  },
  loginBtn: {
    backgroundColor: '#E91E63', 
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  registerLink: { color: '#E91E63', fontSize: 11, fontWeight: 'bold' },
});