import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';

const { width, height } = Dimensions.get('window');

const VideosScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { subjects: realmSubjects, videos: realmVideos } = useDatabase();

  const getSubjectVideos = (subjectKey) => {
    const videos = realmVideos.filter(v => v.subject === subjectKey);
    return videos.map(v => ({
      id: v.id,
      title: v.title,
      videoId: v.videoId,
      thumbnail: v.thumbnail,
      url: `https://youtu.be/${v.videoId}`
    }));
  };

  const openVideoPlayer = (video) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const closeVideoPlayer = () => {
    setModalVisible(false);
    setSelectedVideo(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Videos</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Learn with Video Content</Text>
      </View>

      {/* Subject List */}
      <View style={styles.scrollView}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Subjects</Text>
        {realmSubjects.map((subject) => {
          const videos = getSubjectVideos(subject.key);
          const firstVideo = videos[0];
          const thumbnail = firstVideo ? firstVideo.thumbnail : null;

          return (
            <TouchableOpacity
              key={subject.key}
              style={[styles.subjectCard, { backgroundColor: theme.card, shadowColor: theme.text }]}
              onPress={() => navigation.navigate('SubjectVideos', { title: subject.title, videos: videos, theme: theme, isDarkMode: isDarkMode })}
            >
              <View style={styles.subjectThumbnailContainer}>
                {thumbnail ? (
                  <Image source={{ uri: thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.subjectThumbnailPlaceholder, { backgroundColor: subject.color }]}>
                    <Ionicons name={subject.icon} size={64} color="rgba(255,255,255,0.8)" />
                  </View>
                )}
                <View style={styles.subjectOverlay}>
                  <Text style={styles.subjectName}>{subject.title}</Text>
                  <Text style={styles.subjectCount}>{videos.length} videos</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Video Player Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeVideoPlayer}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeVideoPlayer}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
              {selectedVideo?.title}
            </Text>
          </View>

          {selectedVideo && (
            <WebView
              style={styles.webView}
              source={{
                uri: `https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1`,
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  videoGrid: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  webView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectThumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
  },
  subjectOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subjectCount: {
    fontSize: 14,
    color: '#f1f3f5',
    marginTop: 4,
  },
});

export default VideosScreen;