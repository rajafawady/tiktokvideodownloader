import React, { useState, useEffect } from 'react';
import { TextInput, View, Modal, Text, StyleSheet, Alert,TouchableOpacity,Platform, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import callApi from './callApi';
import { LinearGradient } from 'expo-linear-gradient';
import {managePermission, grantPermission} from './managePermission';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { updateFiles } from './loadFiles';

const HomeScreen = ({ refreshData, process }) => {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [downloadResumable, setDownloadResumable] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [apiData,setApiData]=useState(null);
  const [preparing, setPreparing] = useState(true);


  const startDownload = async () => {
    if (url.trim() === '') {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    if (!url.startsWith('http') && !url.startsWith('https') && !url.includes('tiktok')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    const permi=await managePermission();
    if(permi!=null){
        setDownloadModalVisible(true);
      try{
        const apiData = await callApi(url);
        if(apiData instanceof Error){
          throw Error;
        }else if(apiData===404){
          handleDownloadOption('cancel');
          Alert.alert("Error","You've entered a wrong url!");
        }else{
          setApiData(apiData);
        }
      }catch(e){
        handleDownloadOption('cancel');
        Alert.alert('Error','API response timed out!');
      }
    }else if(permi===null){
      Alert.alert(
        'Perimission Request',
        'Please Grant Permission Access To Continue:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Acess', onPress: () => grantPermission() },
        ],
        { cancelable: true }
      );
    }
    
  };

  const cancelDownload = async () => {
    setProgressModalVisible(false);
  
    if (downloadResumable) {
      try {
        if (downloadResumable.resumeAsync) {
          await downloadResumable.pauseAsync();
          Alert.alert('Download Canceled', 'The download has been canceled.');
          //console.log('cancelled');
        }
      } catch (error) {
        Alert.alert('Cancel Error', 'An error occurred while canceling the download.'+error);
      }
    }
  };

  const handleDownloadOption = (option) => {
    setDownloadModalVisible(false);

    switch (option) {
      case 'video':
        startDownloadWithOption('video');
        break;
      case 'videoNoWatermark':
        startDownloadWithOption('videoNoWatermark');
        break;
      case 'mp3':
        startDownloadWithOption('mp3');
        break;
      default:
        setApiData(null);
        break;
    }
  };

  const getUniqueFilename = async (fileUri) => {
    let count = 1;
    while (await FileSystem.getInfoAsync(fileUri).exists) {
      count++;
      const extension = fileUri.split('.').pop();
      const baseName = fileUri.slice(0, -(extension.length + 1));
      fileUri = `${baseName}${count}.${extension}`;
    }
    return fileUri;
  };

  const storeFileData = async (title,authorUserName,authorAvatar,fileDuration) => {
    const MODIFICATION_TIME_KEY = 'file_modification_times';
    const modTime=new Date();
    const details={
      'title':title,
      'authorUserName':authorUserName,
      'authorAvatar': authorAvatar,
      'fileDuration':fileDuration,
      'modificationTime':modTime,
    };
    try {
      const storedData = await AsyncStorage.getItem(MODIFICATION_TIME_KEY);
      let modificationTimes = {};
      if (storedData) {
        modificationTimes = JSON.parse(storedData);
      }
      modificationTimes[title] = details;      
      await AsyncStorage.setItem(MODIFICATION_TIME_KEY, JSON.stringify(modificationTimes));
    } catch (error) {
      console.error('Error storing modification time:', error);
    }
  };

 const startDownloadWithOption = async (mode) => {
    try {
      setFileTitle('');
      setPreparing(true);
      setProgressModalVisible(true);
      const authorUserName=apiData.author.nickname;
      const authorAvatar=apiData.author.avatar;
      const fileDuration=apiData.duration;
      let title = apiData.title.substring(0, 50);
      title = title.replace(/[^\p{L}0-9\s]/gu, '');
      title = title.trim();      
      if(title===''){
        var date=new Date().getDate();
        title=`${date}`;
      }
      const folderName = 'tiktok video downloader';
      const fileDirectory = `${FileSystem.documentDirectory}${folderName}/`;
      let fileUri = '';
      let downloadUrl = '';
      let mime='';
  
      if (mode === 'video') {
        downloadUrl = apiData.wmplay;
        mime='.mp4';
        fileUri = `${fileDirectory}${title}${mime}`;
      } else if (mode === 'videoNoWatermark') {
        downloadUrl = apiData.play;
        mime='.mp4';
        fileUri = `${fileDirectory}${title}VNMR${mime}`;
      } else if (mode === 'mp3') {
        downloadUrl = apiData.music_info.play;
        mime='.mp3';
        fileUri = `${fileDirectory}${title}${mime}`;
      }
      setFileTitle(title);
      const directoryInfo = await FileSystem.getInfoAsync(fileDirectory);
      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(fileDirectory, { intermediates: true });
      };

      fileUri = await getUniqueFilename(fileUri);
      title=fileUri.substring(fileUri.lastIndexOf('/')+1);
      setProgress(0);
      setPreparing(false);
      const download = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progressPercentage = Math.round(
            (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
          );
          setProgress(progressPercentage);
  
          // Check if the download is complete
          if (progressPercentage === 100) {
            setProgressModalVisible(false);
            Alert.alert('Download Completed',`${title}\nDownloaded Successfully!`);
            setUrl('');
          }
        }
      );
  
      setDownloadResumable(download);
      const { uri } = await download.downloadAsync();
      let testUri=title;
      testUri=encodeURIComponent(testUri);
      storeFileData(testUri,authorUserName,authorAvatar,fileDuration);
      saveFileToStorage(fileUri, title,mode);
      setApiData(null);
    } catch (error) {
      if (error.message !== 'CANCELED') {
        setProgressModalVisible(false);
        Alert.alert('Download Error', 'An error occurred during the download.'+error);
      }
    }
  };
  

const saveFileToStorage = async (fileUri, title,mode) => {
  try {
    if (Platform.OS === "android") {
      let mime='';
      if(mode==='video' || mode==='videoNoWatermark'){
        mime='video/mp4';
      }else{
        mime='audio/mpeg';
      }

      const directoryUri=await managePermission();
      if (directoryUri) {        
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, title, mime)
          .then(async (fileUri) => {
            await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          })
          .catch(e => console.log(e));
      } else {
        Alert.alert("Error","Permission not granted");
      }
    } else if (Platform.OS === 'ios') {
        let path = FileSystem.documentDirectory +'tiktok video downloader/'+ title;
    
        if (mode === 'video' || mode === 'videoNoWatermark') {
          path += '.mp4';
        } else {
          path += '.mp3';
        }
        const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        try{
          if(status){
            const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
          }else{
            Alert.alert("Error","Permission not granted");
          }
        }catch(e){
          Alert.alert("Error Saving File","File couldn't be saved due to some error, please try again.");
        }
        
      }
      
    }catch (error) {
      Alert.alert("Error Saving File","File couldn't be saved due to some error, please try again.");
    }

    try{
      const del=await FileSystem.deleteAsync(fileUri);
      updateFiles();
      refreshData();
    }catch(e){
      //console.log(e);
    };

}; 


  const handleOverlayPress = () => {
    handleDownloadOption('cancel');
  };

  return (
    <View >

      <View style={styles.downloadsContainer}>
      <TextInput
        placeholder="🔗 Paste the URL here"
        value={url}
        onChangeText={setUrl}
        style={styles.input}
      />
      <TouchableOpacity style={styles.downloadButtonContainer} onPress={startDownload}>
        <LinearGradient colors={['rgb(251,116,9)', 'rgb(204,36,140)']} style={styles.buttonGradient}>
        <Ionicons name='download-outline' color="white" size={28} />
        </LinearGradient>
      </TouchableOpacity>
    </View>

      <Modal
        visible={downloadModalVisible}
        onRequestClose={() => setDownloadModalVisible(false)}
        animationType="slide"
        transparent={true}
      >


        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleOverlayPress}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {
                apiData?
                <View style={styles.fileInfoCont}>
                  <View style={styles.fileThumbCont}>
                    <Image style={styles.fileThumb} source={apiData?{uri: apiData.origin_cover }:{uri: ''}} />                   
                  </View>
                  <View>  
                    <Text style={styles.fileTitleText}>{(apiData.title.substring(0,30))}</Text>
                    <Text>Duration: {(Math.round((apiData.duration/1000)/60))}:{(Math.round((apiData.duration/1000)%60))}</Text>
                  </View>
                </View>
                :
                (
                  process()
                )
              }
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => handleDownloadOption('video')}
              >
                
                <Text style={styles.optionText}>Download Video</Text>
                <Text style={styles.mp4Text}>Mp4</Text>
                {
                  apiData?  
                  <Text style={styles.mbText}>{(((apiData.wm_size)/(1024**2)).toFixed(2))} mb</Text>
                  :
                  (process())
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => handleDownloadOption('videoNoWatermark')}
              >
                <Text style={styles.optionText}>Download Video without Watermark</Text>
                <Text style={styles.mp4Text}>Mp4</Text>
                {
                  apiData?  
                  <Text style={styles.mbText}>{(((apiData.size)/(1024**2)).toFixed(2))} mb</Text>
                  :
                  (process())
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => handleDownloadOption('mp3')}
              >
                <Text style={styles.optionText}>Download MP3</Text>
                <Text style={styles.mp4Text}>Mp3</Text>
                {
                  apiData?  
                  <Text style={styles.mbText}>{((((apiData.size)/(1024**2))/4).toFixed(2))} mb</Text>
                  :
                  (process())
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButtonContainer}
                onPress={() => handleDownloadOption('cancel')}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        
      </Modal>

      <Modal
      visible={progressModalVisible}
      onRequestClose={() => setProgressModalVisible(false)}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.progressModalContainer}>
        <View style={styles.progressModalContent}>
          <Text style={styles.progressTitle}>{fileTitle}</Text>
          {preparing ? (
            <View style={styles.progressContainer}>
              <Text style={{fontSize:18,marginBottom:10,}}>Preparing Download</Text>
              {(process())}
            </View>
          ) : (
            <>
            <View style={{flexDirection:'row',justifyContent:"flex-start",position:'relative'}}>
              <View style={styles.progressBarContainer}>
                <View style={ {height:'100%',backgroundColor: '#00bfff', width:`${progress}%` }} />
              </View>
              <Text style={styles.progressText}>Download Progress</Text>
              <Text style={styles.progressPercentageText}>{progress}%</Text>
            </View>
    
            <TouchableOpacity style={styles.cancelButtonContainer} onPress={cancelDownload}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fileInfoCont:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-start',
    columnGap:20,
  },
  fileThumb:{
    width:80,
    height:80,
    borderRadius:5,
  },
  fileTitleText:{
    fontSize:15,
    fontWeight:'bold',
  },
  optionContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center'
  },
  optionText: {
    flex:1,
    fontSize: 18,
    fontWeight: 'bold',
    flexWrap:'wrap',
  },
  mp4Text:{
    width:'30%',
    textAlign:'center',
    fontWeight:'bold'
  },
  mbText:{
    width:'30%',
    textAlign:'center',
    fontWeight:'bold'
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressModalContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems:'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBarContainer: {
    width:'100%',
    height: 5,
    borderRadius: 10,
    backgroundColor: '#ddd',
    overflow: 'hidden',
    justifyContent:'flex-start',
    marginBottom:40,
  },
  progressText: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
    position:'absolute',
    left:0,
  },
  progressPercentageText: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
    position:'absolute',
    right:0,
  },
  downloadsContainer:{
    flexDirection:'row',
    width:"100%",
    columnGap:3,
    justifyContent:'space-between',
    marginBottom:20,
    alignItems:'center',
  },
  input: {
    flex:1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    padding:10,
  },
  downloadButtonContainer: {
    alignItems:'center',
    justifyContent:'center'
  },
  buttonGradient: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 100,
    justifyContent:'center'
  },
});

export default HomeScreen;

