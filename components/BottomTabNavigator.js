import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Main from './Main';
import VideoListScreen from './VideoListScreen';
import AudioListScreen from './AudioListScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
            return <Ionicons name={iconName} color={color} size={size} />;
          } else if (route.name === 'Videos') {
            iconName = 'videocam';
          } else if (route.name === 'Audios') {
            iconName = 'musical-notes';
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: 'rgb(251,116,9)',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Main} />
      <Tab.Screen name="Videos" component={VideoListScreen} />
      <Tab.Screen name="Audios" component={AudioListScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
