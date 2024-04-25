import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image, Modal,ActivityIndicator } from 'react-native'; // Import Modal from react-native
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useIsFocused } from '@react-navigation/native';
import { getFiles } from './loadFiles';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AudioListScreen = () => {
  const [audioList, setAudioList] = useState([]);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const MODIFICATION_TIME_KEY = 'file_modification_times';

  const refreshData = async () => {
    try {
      setLoading(true);
      const files = await getFiles();
      setAudioList(files.filter((item) => !item.isVideo));
      //console.log(audioList);
      setLoading(false);
    } catch (error) {
      setAudioList(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      refreshData();
    }
  }, [isFocused]);

  const playMedia = async (uri) => {
    try {
      IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: uri,
        flags: 1,
      });
    } catch (error) {
      Alert.alert('Error', 'Error opening file: ' + error);
    }
  };
  const removeStoredFileData = async (fileUri) => {
    try {
      const storedData = await AsyncStorage.getItem(MODIFICATION_TIME_KEY);
  
      if (storedData) {
        const modificationTimes = JSON.parse(storedData);
        delete modificationTimes[fileUri];
        await AsyncStorage.setItem(MODIFICATION_TIME_KEY, JSON.stringify(modificationTimes));
      }
    } catch (error) {
      console.error('Error removing stored modification time:', error);
    }
  };

  const deleteFile = (fileUri) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeleteFile(fileUri) },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteFile = async (fileUri) => {
    try {
      handleOverlayPress();
      await FileSystem.deleteAsync(fileUri);
      removeStoredFileData(fileUri);
      refreshData();
    } catch (error) {
      Alert.alert('Error', 'Error deleting file');
    }
  };

  const truncateFilename = (filename) => {
    if (filename.length > 25) {
      return filename.substring(0, 40) + '...';
    }
    return filename;
  };

  const shareFile = async (fileUri,name) => {
    try {
      // Get local file URI from content URI
      await FileSystem.StorageAccessFramework.copyAsync({from:fileUri,to:`${FileSystem.cacheDirectory}`});
      const localFileUri = `${FileSystem.cacheDirectory}/${name}`;
  
      const shareOptions = {
        mimeType: 'audio/mpeg',
        dialogTitle: 'Share ',
      };
  
      const shared = await Sharing.shareAsync(localFileUri, shareOptions);
      setShowModal(false); // Hide the modal after sharing the file
    } catch (e) {
      console.log(e);
    }
    try{
      const del=await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}/${name}`);
      //console.log('deleted success '+del);
    }catch(e){
      //console.log(e);
    };
  };

  const handleShareFile=(uri,name)=>{
    shareFile(uri,name);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleOverlayPress = () => {
    setShowModal(false);
  };

  const renderAudioItem = ({ item }) => {
    const { fileName, thumbnailUri, fileUri, fileData,size } = item;
    const truncatedAudioName = truncateFilename(fileName);

    return (
      
      <View style={styles.videoItem}>
      <TouchableOpacity style={styles.thumbnailCont} onPress={()=>playMedia(fileUri)}>
      {thumbnailUri ? (
        <Image style={styles.thumbnail} source={{ uri: thumbnailUri }} />
      ) : (
        <MaterialCommunityIcons name="music" size={40} color="black" style={styles.icon} />
      )}
      </TouchableOpacity>
      <View style={styles.videoOptions}>
          <View style={styles.userDet}>
            <TouchableOpacity style={styles.videoTitle} onPress={()=>playMedia(fileUri)} >
              <Text numberOfLines={1} style={styles.videoTitle}>{truncatedAudioName}</Text>
            </TouchableOpacity>
            <View style={styles.userProfileCont}> 
              <Text style={{fontWeight:'bold',marginTop:5,}}>{size} mb</Text>             
              <TouchableOpacity onPress={() => handleOpenModal(item)} style={styles.optionDots}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="black" style={styles.menuIcon} />
              </TouchableOpacity>
            </View>
            
          </View>
      </View>
    </View>
      
    );
  };

  return (
    <View style={styles.container}>
      {(loading && audioList) ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) :(audioList && audioList[0]) ? (
        <FlatList data={audioList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAudioItem} 
          style={styles.itemContainer}
          />
      ) : (
        <Text style={{textAlign:'center',fontWeight: 'bold',}}>No audio files found.</Text>
      )}

<Modal visible={showModal} animationType="slide" transparent={true}>
  <TouchableOpacity
    style={styles.overlay}
    activeOpacity={1}
    onPress={handleOverlayPress}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.detailsContainer}>
            <MaterialCommunityIcons name="music" size={40} color="black" style={styles.icon} />
          <Text style={styles.modalOption}>{selectedItem?.fileName}</Text>
        </View>
        <TouchableOpacity style={styles.optionContainer} onPress={() => playMedia(selectedItem?.fileUri)}>
          <Text style={styles.modalOption}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionContainer} onPress={() => handleShareFile(selectedItem?.fileUri, selectedItem?.fileName)}>
          <Text style={styles.modalOption}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionContainer} onPress={() => deleteFile(selectedItem?.fileUri)}>
          <Text style={styles.modalOption}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButtonContainer} onPress={handleCloseModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      padding: 20,
      justifyContent:'center',

    },
    icon: {
      width: 50,
      height: 50,
      marginRight: 10,
      textAlign: 'center',
      alignItems: 'center',
    },
    deleteIcon: {
      marginLeft: 10,
    },
    shareIcon: {
      marginLeft: 10,
    },
    menuIcon: {
      flex: 1, // Aligns the icon to the right
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      },
      modalOption: {
        fontSize: 18,
        fontWeight: 'bold',

      },
      optionContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'flex-end',
      },
      modalThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 10,
      },
      detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 50,
  },
  cancelButtonContainer: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:'center',
  },
  itemContainer:{
    padding:5,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom:10,
    alignItems:'center',
    justifyContent:'flex-start',
    paddingHorizontal:15,
    columnGap:-10,
  },
  thumbnail: {
    width:65,
    height:60,
    borderRadius: 5,
    margin:'auto',
  },
  thumbnailCont:{
    width:'18%',
    height:'60%',
    borderRadius:5,
    borderWidth:2,
  },
  videoOptions:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-around',
    padding:10,

  },
  userProfileCont:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  userDet:{
    minWidth:'100%',
    paddingHorizontal:35,
  },
  optionDots:{
    maxWidth:'100%',
    padding:8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight:'bold',
  },
  });

export default AudioListScreen;
