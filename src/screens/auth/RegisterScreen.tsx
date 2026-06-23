import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../utils/firebase';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State Re-password
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State show/hide Re-password
  
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Cek field kosong
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi!');
      return;
    }
    // 2. Cek spasi di username
    if (username.includes(' ')) {
      Alert.alert('Error', 'Username tidak boleh menggunakan spasi!');
      return;
    }
    // 3. Cek panjang password
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter!');
      return;
    }
    // 4. CEK KECOCOKAN RE-PASSWORD
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: name,
        username: username.toLowerCase(),
        email: email,
        photoURL: '',
        bio: '',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date(),
      });
    } catch (error: any) {
      Alert.alert('Register Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        
        <View style={styles.card}>
          <Text style={styles.logo}>MediaNova</Text>
          <Text style={styles.title}>Join the Community</Text>
          <Text style={styles.subtitle}>Start your journey into high-energy creation.</Text>

          {/* Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.inputDark}
            placeholder="Alex Rivera"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />

          {/* Username Input */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.inputDark}
            placeholder="alexrivera"
            placeholderTextColor="#555"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none" 
            autoCorrect={false}
          />

          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.inputDark}
            placeholder="alex@creators.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainerDark}>
            <TextInput
              style={styles.passwordInputDark}
              placeholder="••••••••"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeTextDark}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Re-Password Input (Baru) */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainerDark}>
            <TextInput
              style={styles.passwordInputDark}
              placeholder="••••••••"
              placeholderTextColor="#555"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword} // pakai state showConfirmPassword
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeTextDark}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.registerText}>Create Account</Text>
            }
          </TouchableOpacity>

          {/* Navigation to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>OR </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 40, paddingBottom: 60 }, // paddingBottom saya naikin ke 60 biar gak ketutup keyboard
  card: {
    backgroundColor: '#15151A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  logo: { 
    fontSize: 26, 
    fontWeight: '800', 
    fontStyle: 'italic',
    color: '#E91E63', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#A0A0AB', textAlign: 'center', marginBottom: 24 },
  label: {
    color: '#E91E63', 
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  inputDark: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#33333F',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
  },
  passwordContainerDark: {
    flexDirection: 'row',
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#33333F',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInputDark: {
    flex: 1,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 15,
  },
  eyeButton: { padding: 4 },
  eyeTextDark: {
    color: '#E91E63', 
    fontSize: 12,
    fontWeight: 'bold',
  },
  registerBtn: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  loginLink: { color: '#E91E63', fontSize: 11, fontWeight: 'bold' },
});