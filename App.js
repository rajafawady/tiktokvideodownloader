import React,{useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLayout from './components/MainNavigator';
import "react-native-gesture-handler";
import {StatusBar} from 'react-native';

const App = () => {

    return(
        <NavigationContainer>
          <StatusBar hidden={false} backgroundColor="rgb(251,116,9)" />
          <AppLayout />
        </NavigationContainer>
    );   
};

export default App;
