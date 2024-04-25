import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import HomeScreen from './HomeScreen';
import HomeVideos from './HomeVideos';
import { getFiles } from './loadFiles';

const Main = () => {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const files = await getFiles();
      const firstTwoVideoFiles = files.filter((item) => item.isVideo).slice(0, 2);
      setVideoList(firstTwoVideoFiles);
      setLoading(false);
    } catch (error) {
      //console.error('Error loading video files:', error);
      setVideoList(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);
  
  const process=()=>{
    return(<ActivityIndicator style={{marginBottom:20,}} size="large" color="rgb(251,116,9)" />);
  };

  return (
    <View style={{ flex: 1, padding:15, }}>
      <HomeScreen refreshData={refreshData} process={process}/>
      <HomeVideos refreshData={refreshData} loading={loading} setLoading={setLoading} videoList={videoList} process={process} />
    </View>
  );
};

export default Main;
