import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions,
  TouchableOpacity, ViewToken, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform,
  Alert, StatusBar
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection, query, where, orderBy, limit, getDocs,
  doc, updateDoc, increment, addDoc, serverTimestamp,
  arrayUnion, arrayRemove
} from 'firebase/firestore';
import * as MediaLibrary from 'expo-media-library';
import { db } from '../../utils/firebase';
import { useStore } from '../../store/useStore';

const { height, width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;
const VIDEO_HEIGHT = height - TAB_BAR_HEIGHT;

// Komponen per item video
const VideoItem = ({ item, isActive, onLike, onComment, onSave }: any) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);

  const player = useVideoPlayer(item.mediaURL || null, (p) => {
    p.loop = true;
  });

  // Play/pause saat jadi active atau tidak
  useEffect(() => {
    if (isActive && item.mediaURL) {
      if (!isPaused) player.play();
    } else {
      player.pause();
    }
    return () => {
      clearInterval(progressInterval.current);
    };
  }, [isActive]);

  // Update progress bar setiap 500ms
  useEffect(() => {
    if (isActive && !isPaused) {
      progressInterval.current = setInterval(() => {
        try {
          const duration = player.duration;
          const current = player.currentTime;
          if (duration > 0) {
            setProgress(current / duration);
          }
        } catch (e) {}
      }, 500);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isActive, isPaused]);

  const togglePause = () => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
  };

  return (
    <View style={styles.videoContainer}>
      {item.mediaURL ? (
        <TouchableOpacity
          style={styles.videoWrapper}
          onPress={togglePause}
          activeOpacity={1}
        >
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
          {/* Pause indicator */}
          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.noVideo}>
          <Text style={styles.noVideoText}>🎬</Text>
        </View>
      )}

      {/* Progress bar tipis di bawah */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Overlay UI */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Kanan: action buttons */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onLike(item.id, item.isLiked)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={item.isLiked ? '#E91E63' : '#fff'}
            />
            <Text style={styles.actionText}>{item.likesCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={30} color="#fff" />
            <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSave(item.mediaURL, item.id)}
          >
            <Ionicons
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={30}
              color={item.isSaved ? '#E91E63' : '#fff'}
            />
            <Text style={styles.actionText}>Simpan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={30} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bawah: info video */}
        <View style={styles.bottomInfo}>
          <Text style={styles.videoUsername}>@{item.userDisplayName}</Text>
          <Text style={styles.videoCaption} numberOfLines={2}>
            {item.caption}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function VideoFeedScreen({ navigation }: any) {
  const { currentUser } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Stop video saat pindah screen
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const fetchVideos = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('mediaType', '==', 'video'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        isLiked: false,
        isSaved: false,
      }));
      setVideos(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        likesCount: increment(isLiked ? -1 : 1)
      });
      setVideos(prev => prev.map(v =>
        v.id === postId
          ? { ...v, isLiked: !isLiked, likesCount: (v.likesCount || 0) + (isLiked ? -1 : 1) }
          : v
      ));
    } catch (e) { console.log(e); }
  };

  const handleSave = async (mediaURL: string, postId: string) => {
    try {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Error', 'Butuh izin untuk menyimpan video!');
        return;
      }
      Alert.alert('Menyimpan...', 'Video sedang disimpan ke galeri');
      await MediaLibrary.saveToLibraryAsync(mediaURL);
      setVideos(prev => prev.map(v =>
        v.id === postId ? { ...v, isSaved: true } : v
      ));
      Alert.alert('Berhasil! ✅', 'Video tersimpan ke galeri');
    } catch (e) {
      Alert.alert('Gagal', 'Tidak bisa menyimpan video');
    }
  };

  const openComments = async (postId: string) => {
    setSelectedPostId(postId);
    setCommentModal(true);
    try {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const commentData = {
        userId: currentUser?.uid,
        userDisplayName: currentUser?.displayName,
        text: commentText,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'posts', selectedPostId, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', selectedPostId), { commentsCount: increment(1) });
      setComments(prev => [{ id: Date.now().toString(), ...commentData, createdAt: new Date() }, ...prev]);
      setVideos(prev => prev.map(v =>
        v.id === selectedPostId ? { ...v, commentsCount: (v.commentsCount || 0) + 1 } : v
      ));
      setCommentText('');
    } catch (e) {
      Alert.alert('Error', 'Gagal kirim komentar');
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index || 0);
      }
    }, []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={styles.emptyLabel}>Belum ada video</Text>
        <Text style={styles.emptySubLabel}>Upload video pertama kamu!</Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.uploadBtnText}>Upload Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoItem
            item={item}
            isActive={index === activeIndex && isFocused}
            onLike={handleLike}
            onComment={openComments}
            onSave={handleSave}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({
          length: VIDEO_HEIGHT,
          offset: VIDEO_HEIGHT * index,
          index,
        })}
      />

      {/* Comment Modal */}
      <Modal
        visible={commentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Komentar</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.commentList}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {item.userDisplayName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentName}>{item.userDisplayName}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noComments}>Belum ada komentar</Text>
              }
            />
            <View style={styles.commentInputBox}>
              <TextInput
                style={styles.commentInput}
                placeholder="Tulis komentar..."
                placeholderTextColor="#888"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleComment}
                disabled={commentLoading}
              >
                {commentLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="send" size={20} color="#fff" />
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyLabel: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubLabel: { color: '#888', fontSize: 14, marginBottom: 24 },
  uploadBtn: { backgroundColor: '#E91E63', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  uploadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  videoContainer: { width, height: VIDEO_HEIGHT, backgroundColor: '#000' },
  videoWrapper: { width, height: VIDEO_HEIGHT },
  video: { width, height: VIDEO_HEIGHT },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  noVideo: { width, height: VIDEO_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  noVideoText: { fontSize: 80 },
  progressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressBarFill: { height: 3, backgroundColor: '#E91E63' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 },
  rightActions: { position: 'absolute', right: 12, bottom: 100, alignItems: 'center', gap: 20 },
  actionBtn: { alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 11, marginTop: 3, textShadowColor: '#000', textShadowRadius: 4 },
  bottomInfo: { position: 'absolute', bottom: 20, left: 12, right: 80 },
  videoUsername: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4, textShadowColor: '#000', textShadowRadius: 4 },
  videoCaption: { color: '#eee', fontSize: 13, textShadowColor: '#000', textShadowRadius: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  commentList: { maxHeight: 300 },
  commentItem: { flexDirection: 'row', padding: 12, gap: 10 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E91E63', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  commentContent: { flex: 1 },
  commentName: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  commentText: { color: '#aaa', fontSize: 14 },
  noComments: { color: '#888', textAlign: 'center', padding: 20 },
  commentInputBox: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#222' },
  commentInput: { flex: 1, backgroundColor: '#222', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, color: '#fff' },
  sendBtn: { backgroundColor: '#E91E63', borderRadius: 20, width: 40, justifyContent: 'center', alignItems: 'center' },
});