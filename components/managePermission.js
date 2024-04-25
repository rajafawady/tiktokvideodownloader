import { Alert} from 'react-native';
import * as FileSystem from 'expo-file-system';
const readFile = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${'path.txt'}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      //console.log(fileInfo);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        return content;
      } else {
        // If the file doesn't exist, create it with empty content
        await FileSystem.writeAsStringAsync(fileUri, '');
        return null;
      }
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  };

  const managePermission=async()=>{
    const path=`${FileSystem.documentDirectory}${'path.txt'}`;
    const check=await readFile();
    if(check!=null){
      try{
        const info=await FileSystem.StorageAccessFramework.readDirectoryAsync(check);
        return check;
      }catch(e){
        try{
          const del=await FileSystem.deleteAsync(path);
        }catch(e){
          //console.log("Del error: ",e)
        }
        return null;
      }
    }else{
        return null;
    }
  };

  const grantPermission=async()=>{
    const path=`${FileSystem.documentDirectory}${'path.txt'}`;
    try{
      const del=await FileSystem.deleteAsync(path);
    }catch(e){
      //console.log("Del error: ",e)
    };
    try{
      var temp = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      await FileSystem.writeAsStringAsync(path, temp.directoryUri);
    }catch(e){
      Alert.alert("Error","Permission Couldn't be granted!");
    }
    
  };

export {managePermission,grantPermission};