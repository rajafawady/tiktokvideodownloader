import React, { useState } from 'react';
import { StyleSheet,View,Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import { Ionicons } from '@expo/vector-icons';
import InfoModal from './InfoModal';
import PrivacyPolicy from './PrivacyPolicy';
import TC from './TermsAndConditions';
import Header from './Header';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

const AppLayout = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleInfoVisible = () => {
    setInfoVisible(!infoVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const getHeader=()=>{
    return(<Header
      toggleInfoVisible={toggleInfoVisible}
      toggleSidebar={toggleSidebar}
    />);
  };
  const getHomeTitle=()=>{
    return(
      <View style={styles.menuStyle}>
        <Ionicons name='home-outline' color="black" size={25} />
        <Text>Home</Text>
      </View>
    );
  };

  const getPolicyTitle=()=>{
    return(
      <View style={styles.menuStyle}>
        <Ionicons name='book-outline' color="black" size={25} />
        <Text>Privacy Policy</Text>
      </View>
    );
  }
  const getTCTitle=()=>{
    return(
      <View style={styles.menuStyle}>
        <Ionicons name='checkbox-outline' color="black" size={25} />
        <Text>Terms And Conditions</Text>
      </View>
    );
  }


  return (
    <>
      
      
      <Drawer.Navigator
        drawerType="slide"
        overlayColor="transparent"
        screenOptions={{drawerActiveTintColor:'rgb(251,116,9)'}}
        drawerStyle={styles.drawerStyle}
        drawerContent={props=> <CustomDrawer {...props} />}
      >
        <Drawer.Screen name="Main" component={BottomTabNavigator} options={{title: getHomeTitle, headerTitle:getHeader}}/>
        <Drawer.Screen name="Privacy Policy" component={PrivacyPolicy} options={{title:getPolicyTitle , headerTitle:getHeader}}/>
        <Drawer.Screen name="Terms and Conditions" component={TC} options={{title:getTCTitle , headerTitle:getHeader}}/>
      </Drawer.Navigator>
      <InfoModal infoVisible={infoVisible} toggleInfoVisible={toggleInfoVisible} />
    </>
  );
};

const styles = StyleSheet.create({
  drawerStyle: {
    width: '60%',
  },
  menuStyle:{
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems:'center',
    margin:10,
    columnGap:10,
  },
});

export default AppLayout;
