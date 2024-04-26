import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InfoModal = ({ infoVisible, toggleInfoVisible }) => {
  if (!infoVisible) {
    return null; // Render nothing if infoVisible is false
  }

  const handleOverlayPress = () => {
    toggleInfoVisible(false);
  };

  return (
    <View style={styles.infoContainer}>
      <TouchableOpacity onPress={handleOverlayPress} style={styles.overlay} />
      <View style={styles.infoContent}>
        <TouchableOpacity onPress={() => toggleInfoVisible(false)} style={styles.closeIconContainer}>
          <Ionicons name="close-circle" color="#ff003d" size={30} />
        </TouchableOpacity>
        <Text style={styles.heading}>How to?</Text>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <Ionicons name='link' color="#ff003d" size={50} style={{ textAlign: 'center' }} />
          <Text style={styles.infoText}>
            Click on the share button in TikTok. Open the video in TikTok Video Downloader app by clicking the icon from share menu or copy the link of the video.
          </Text>
          <Ionicons name='download' color="#ff003d" size={50} style={{ textAlign: 'center' }} />
          <Text style={styles.infoText}>
            Paste the link, click the download button, select your desired option, and download the file.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    maxHeight: '80%', // Added to limit the height of the info content
  },
  closeIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContentContainer: {
    flexGrow: 1, // Added to make the scrollable content fill the available space
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default InfoModal;
