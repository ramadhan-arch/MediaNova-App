import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setUserResults([]);
      setPostResults([]);
      return;
    }
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', text),
        where('displayName', '<=', text + '\uf8ff')
      );
      const usersSnapshot = await getDocs(usersQuery);
      setUserResults(usersSnapshot.docs.map(doc => ({ id: doc.id, type: 'user', ...doc.data() })));

      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const keyword = text.toLowerCase();
      const posts = postsSnapshot.docs
        .map(doc => ({ id: doc.id, type: 'post', ...doc.data() }))
        .filter((post: any) =>
          post.caption?.toLowerCase().includes(keyword) ||
          post.userDisplayName?.toLowerCase().includes(keyword) ||
          post.mediaType?.toLowerCase().includes(keyword)
        );
      setPostResults(posts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cari</Text>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cari user..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      {loading && <ActivityIndicator color="#E91E63" style={{ marginTop: 20 }} />}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Users ({userResults.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Konten ({postResults.length})
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeTab === 'users' ? userResults : postResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem}>
            <View style={[styles.avatar, activeTab === 'posts' && styles.postBadge]}>
              <Text style={styles.avatarText}>
                {activeTab === 'users'
                  ? item.displayName?.charAt(0).toUpperCase()
                  : item.mediaType === 'video' ? 'V' : item.mediaType === 'audio' ? 'A' : 'P'}
              </Text>
            </View>
            <View>
              <Text style={styles.displayName}>
                {activeTab === 'users' ? item.displayName : item.caption || 'Post tanpa caption'}
              </Text>
              <Text style={styles.email}>
                {activeTab === 'users'
                  ? item.email
                  : `@${item.userDisplayName || 'user'} • ${item.mediaType || 'post'}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searchText.length > 0 && !loading ? (
            <Text style={styles.emptyText}>
              {activeTab === 'users' ? 'User tidak ditemukan' : 'Konten tidak ditemukan'}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  searchBox: { padding: 12 },
  searchInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, backgroundColor: '#111', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#E91E63' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E91E63', justifyContent: 'center', alignItems: 'center' },
  postBadge: { backgroundColor: '#333' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  displayName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  email: { color: '#888', fontSize: 13 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
});
