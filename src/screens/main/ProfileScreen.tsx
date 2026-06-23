import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Switch, ActivityIndicator
} from 'react-native';
import { signOut } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../utils/firebase';
import { useStore } from '../../store/useStore';

export default function ProfileScreen({ route }: any) {
  const { currentUser, isDarkMode, toggleDarkMode } = useStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !route?.params?.userId ||
    route?.params?.userId === currentUser?.uid;
  const targetUserId = route?.params?.userId || currentUser?.uid;

  useEffect(() => {
    fetchProfile();
  }, [targetUserId]);

  const fetchProfile = async () => {
    if (!targetUserId) return;
    try {
      const snap = await getDoc(doc(db, 'users', targetUserId));
      if (snap.exists()) {
        const data = snap.data();
        setProfileData(data);
        if (!isOwnProfile && currentUser?.uid) {
          setIsFollowing(data.followers?.includes(currentUser.uid) || false);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleFollow = async () => {
    if (!currentUser?.uid || !targetUserId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await updateDoc(doc(db, 'users', targetUserId), {
          followers: arrayRemove(currentUser.uid),
          followersCount: increment(-1)
        });
        await updateDoc(doc(db, 'users', currentUser.uid), {
          following: arrayRemove(targetUserId),
          followingCount: increment(-1)
        });
        setIsFollowing(false);
        setProfileData((prev: any) => ({
          ...prev,
          followersCount: (prev.followersCount || 1) - 1
        }));
      } else {
        await updateDoc(doc(db, 'users', targetUserId), {
          followers: arrayUnion(currentUser.uid),
          followersCount: increment(1)
        });
        await updateDoc(doc(db, 'users', currentUser.uid), {
          following: arrayUnion(targetUserId),
          followingCount: increment(1)
        });
        setIsFollowing(true);
        setProfileData((prev: any) => ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1
        }));
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal follow/unfollow');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin mau logout?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await signOut(auth);
        }
      }
    ]);
  };

  const bgColor = isDarkMode ? '#000' : '#f5f5f5';
  const cardColor = isDarkMode ? '#111' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#000';
  const subTextColor = isDarkMode ? '#888' : '#666';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: cardColor }]}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {(profileData?.displayName || currentUser?.displayName)?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        <Text style={[styles.displayName, { color: textColor }]}>
          {profileData?.displayName || currentUser?.displayName}
        </Text>
        <Text style={[styles.email, { color: subTextColor }]}>
          {profileData?.email || currentUser?.email}
        </Text>

        {profileData?.bio ? (
          <Text style={[styles.bio, { color: subTextColor }]}>{profileData.bio}</Text>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {profileData?.followersCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {profileData?.followingCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Following</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollow}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.followBtnText}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {isOwnProfile && (
        <>
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: subTextColor }]}>Pengaturan</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color={textColor} />
                <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#333', true: '#E91E63' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff3333" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 24, marginBottom: 12 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E91E63', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  displayName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 8 },
  bio: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statDivider: { width: 1, height: 32, backgroundColor: '#333' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 13 },
  followBtn: { backgroundColor: '#E91E63', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 24 },
  followingBtn: { backgroundColor: '#333' },
  followBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  section: { marginBottom: 12, padding: 16 },
  sectionTitle: { fontSize: 12, marginBottom: 12, textTransform: 'uppercase' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, backgroundColor: '#1a0000', borderWidth: 1, borderColor: '#ff3333', borderRadius: 12, padding: 16 },
  logoutText: { color: '#ff3333', fontSize: 16, fontWeight: 'bold' },
});