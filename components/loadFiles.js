import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {managePermission} from './managePermission';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODIFICATION_TIME_KEY = 'file_modification_times';
let storedData=null;
let cachedVideoListData = null;
let isDataLoaded = false;

const updateFiles=()=>{
  AsyncStorage.getItem(MODIFICATION_TIME_KEY)
      .then((result) => {
        storedData=result;
      })
      .catch((error) => {
        storedData=null;
      });
  isDataLoaded = false;
}

const getFiles = async () => {

  AsyncStorage.getItem(MODIFICATION_TIME_KEY)
      .then((result) => {
        storedData=result;
      })
      .catch((error) => {
        storedData=null;
      });

  if (isDataLoaded && cachedVideoListData) {
    const folderPath = await managePermission();
    let fileInfo=null;
    try{
      fileInfo = await FileSystem.StorageAccessFramework.readDirectoryAsync(folderPath);
      if (fileInfo) {
        const newFiles = fileInfo.filter(
          (file) =>
            (file.endsWith('mp3') || file.endsWith('mp4')) &&
            !cachedVideoListData.some((cachedFile) => cachedFile.fileUri === file)
        );
  
        if (newFiles.length > 0) {
          const newVideoListData = await fetchNewFiles(newFiles);
          cachedVideoListData.unshift(...newVideoListData);
        }
  
        // Remove deleted files from cachedVideoListData
        cachedVideoListData = cachedVideoListData.filter((cachedFile) =>
          fileInfo.includes(cachedFile.fileUri)
        );
      }
  
      return cachedVideoListData;
    }catch(error){
      return null;
    };
    
  }

  const videoListData = [];
  const folderPath = await managePermission();
  try {
    const fileInfo = await FileSystem.StorageAccessFramework.readDirectoryAsync(folderPath);
    if (fileInfo) {
      for (let i = 0; i < fileInfo.length; i++) {
        if (fileInfo[i].endsWith('.mp4') || fileInfo[i].endsWith('.mp3')) {
          const fileUri = fileInfo[i];
          const decodedPath = decodeURIComponent(fileUri);
          const path = decodedPath.substring(decodedPath.lastIndexOf('/') + 1);
          const fileName = path;
          const isVideo = fileUri.endsWith('mp4');
          const fileData=await getStoredFileData(encodeURIComponent(fileName));
          const fileDet=await FileSystem.getInfoAsync(fileUri);
          let storedModificationTime=null
          try{
            storedModificationTime = fileData.modificationTime;
          }catch(error){
            storedModificationTime=null;
          };
          const fileExists =fileDet.exists;
          if(storedModificationTime && fileExists){
            let size=fileDet.size;
            size=((size)/(1024)**2).toFixed(2);
            const thumbnailUri = isVideo ? await getThumbnailUri(fileUri) : null;
            videoListData.push({
              fileName,
              fileUri,
              thumbnailUri,
              isVideo,
              fileData,
              size,
              modificationTime:new Date(storedModificationTime),
            });
          } 
        }
      }
      videoListData.sort((b, a) => a.modificationTime - b.modificationTime);
    }
  } catch (e) {
    //console.log(e);
    videoListData=null;
  }

  cachedVideoListData = videoListData;
  isDataLoaded = true;

  return videoListData;
};

const getThumbnailUri = async (fileUri) => {
  try {
    const thumbnail = await VideoThumbnails.getThumbnailAsync(fileUri);
    return thumbnail.uri;
  } catch (error) {
    console.error('Error getting thumbnail URI:', error);
    return null;
  }
};
const getStoredFileData = async (fileUri) => {
  try {
    if (storedData) {
      const modificationTimes = JSON.parse(storedData);
      try{
        const data=modificationTimes[fileUri];
        return data;
      }catch(error){
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting stored modification times:', error);
    return null;
  }
};

const fetchNewFiles = async (newFiles) => {
  const newVideoListData = [];
  for (let i = 0; i < newFiles.length; i++) {
    const fileUri = newFiles[i];
    const decodedPath = decodeURIComponent(fileUri);
    const path = decodedPath.substring(decodedPath.lastIndexOf('/') + 1);
    const fileName = path;
    const isVideo = fileUri.endsWith('mp4');
    const fileData=await getStoredFileData(encodeURIComponent(fileName));
    const fileDet=await FileSystem.getInfoAsync(fileUri);
    let size=fileDet.size;
    size=((size)/(1024)**2).toFixed(2);
    let storedModificationTime=null
    try{
      storedModificationTime = fileData.modificationTime;
    }catch(error){
      storedModificationTime=null;
    }
    
    if(storedModificationTime){
      const thumbnailUri = isVideo ? await getThumbnailUri(fileUri) : null;
      newVideoListData.push({
        fileName,
        fileUri,
        thumbnailUri,
        isVideo,
        fileData,
        size,
        modificationTime:new Date(storedModificationTime),
      });
    }
  newVideoListData.sort((a, b) => a.modificationTime - b.modificationTime);
  return newVideoListData;
  }
};


export {getFiles,updateFiles};
