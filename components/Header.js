import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ toggleInfoVisible }) => {
  

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>TIKTOK VIDEO DOWNLOADER</Text>
      <TouchableOpacity onPress={toggleInfoVisible}>
        <Ionicons name='information-circle-outline' color="black" size={25} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 15,
  },
});

export default Header;
