import React, { useEffect } from 'react';
import { BackHandler, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const ExitButton = () => {
    const handleExitApp = () => {
      BackHandler.exitApp();
    };
  
    useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleExitApp);
  
      return () => {
        backHandler.remove();
      };
    }, []);
  
    return (
      <TouchableOpacity style={styles.exitButton} onPress={handleExitApp}>
        <Ionicons name='exit-outline' color="black" size={25} />
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    exitButton: {
      width:'100%',
      flexDirection: 'row',
      justifyContent:'flex-start',
      alignItems:'center',
      margin:10,
      columnGap:10,
      padding:18,
    },
    exitButtonText: {
      fontSize:15,
      color: 'black',
      textAlign: 'center',
    },
  });
export default ExitButton;    