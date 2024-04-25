import React from 'react';
import { View,Image,Share,TouchableOpacity,StyleSheet, Text } from 'react-native';
import { DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import ExitButton from './ExitButton';
const CustomDrawer = (props) => {
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Check out this TikTok Video Downloader app!',
      });
    } catch (error) {
      //console.log(error);
    }
  };
  return (
    <View>
      <View style={styles.imageContainer}>
          <Image source={require('../assets/test.png')} style={styles.image} />
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity onPress={handleSharePress} style={styles.sharebutton}>
          <Ionicons name='share-social' color="black" size={25} />
          <Text>Share Our App</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sharebutton}>
          <Ionicons name='star-outline' color="black" size={25} />
          <Text>Rate Us</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sharebutton}>
          <Ionicons name='globe-outline' color="black" size={25} />
          <Text>Support Website</Text>
      </TouchableOpacity>
      <ExitButton />
    </View>
  );
};

const styles=StyleSheet.create({
  sharebutton:{
    width:'100%',
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems:'center',
    margin:10,
    columnGap:10,
    padding:18,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
  },
});

export default CustomDrawer;
