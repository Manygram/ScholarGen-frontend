import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

function extractVideoId(url) {
  try {
    // Handle youtu.be short links
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // Handle watch?v= links
    const watchMatch = url.match(/[?&]v=([^&#]+)/);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    // Handle embed links
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return null;
  } catch (e) {
    return null;
  }
}

const SubjectVideosScreen = ({ navigation, route }) => {
  const { subject, videos, theme, isDarkMode } = route.params || { subject: 'Subject', videos: [], theme: { background: '#fff', text: '#000', card: '#fff', border: '#eee' }, isDarkMode: false };
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const parsedVideos = useMemo(() => {
    return (videos || []).map((video, index) => {
      if (typeof video === 'string') {
        const id = extractVideoId(video);
        // Generate a more descriptive title based on the subject and index
        const title = `${subject} Lesson ${index + 1}: Key Concepts`;
        return {
          id,
          url: video,
          thumbnail: undefined,
        };
      } else {
        // It's an object from Realm
        return {
          id: video.videoId,
          url: video.url,
          title: video.title,
          thumbnail: video.thumbnail,
        };
      }
    }).filter(v => !!v.id);
  }, [videos, subject]);

  const openVideo = (id) => {
    setSelectedVideoId(id);
    setModalVisible(true);
  };

  const closeVideo = () => {
    setModalVisible(false);
    setSelectedVideoId(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{subject}</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* List of videos */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {parsedVideos.map((video, idx) => (
          <TouchableOpacity
            key={video.id + idx}
            style={[styles.videoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={() => openVideo(video.id)}
          >
            {video.thumbnail ? (
              <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            ) : (
              <Image source={require('../../assets/splash-logo.png')} style={styles.thumbnail} resizeMode="cover" />
            )}
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>{video.title}</Text>
              <View style={styles.videoMeta}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary || '#666'} />
                <Text style={[styles.videoMetaText, { color: theme.textSecondary || '#666' }]}>Educational Content</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full Screen Video Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideo}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#000' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={closeVideo}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {selectedVideoId && (
            <WebView
              style={styles.webView}
              originWhitelist={['*']}
              source={{
                uri: `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1`,
              }}
              allowsFullscreenVideo={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              scrollEnabled={false}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },

  listContent: { padding: 16 },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  thumbnail: { width: '100%', height: 200 },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 6 },
  videoMeta: { flexDirection: 'row', alignItems: 'center' },
  videoMetaText: { marginLeft: 6, fontSize: 12, color: '#666' },

  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  webView: { width: '100%', flex: 1 },
});

export default SubjectVideosScreen;