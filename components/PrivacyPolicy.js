import React from 'react';
import { View, Text, StyleSheet,ScrollView  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const PrivacyPolicy = () => {

  return (
    <View style={styles.sidebarContainer}>
      <LinearGradient colors={['#000000', '#790944']} style={styles.headingContainer}>
        <Text style={styles.heading}>Privacy Policy</Text>
      </LinearGradient>
      <ScrollView>
      <Text style={styles.text}>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio ea consectetur facilis, excepturi necessitatibus ad minus! Nostrum corrupti natus quis doloribus minus sunt saepe explicabo itaque ad unde fuga nam tempore ipsum id accusantium autem repellat quia, voluptatum eius ullam eaque? At ducimus numquam aut. Tempora, delectus! Animi possimus voluptatibus tempora veritatis. Suscipit doloribus deleniti architecto sapiente quod doloremque aut dolorum modi laborum consequatur at quam temporibus minus totam soluta laboriosam autem vitae, repellendus natus illo! Sapiente quo nam quidem eligendi. Quas voluptatem eos, rerum, animi aspernatur sed debitis hic veniam labore, repudiandae voluptates quos explicabo sequi nemo? Pariatur est in qui modi assumenda illo nemo perspiciatis, natus officiis minus incidunt quas nulla quis doloribus dolores quidem. Accusamus, tempora ut molestiae praesentium, cum odit magni sapiente quia reprehenderit debitis, veritatis a minus ad expedita! Itaque enim error natus architecto sint. Deleniti cum aliquam neque deserunt ea quas, ut maxime, nihil sed similique eum obcaecati dolorem necessitatibus modi quidem quis iusto iste fuga architecto ipsam fugit unde. Et, blanditiis omnis. Consequatur, eos quisquam, suscipit vel illum sapiente cum consectetur quae qui quaerat quidem, tenetur modi! Ipsa, sed! Inventore, sunt veritatis quasi provident animi odit laborum nam repellat possimus natus cum amet!
      </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    padding:12,
    textAlign: 'justify',
    
  },
  heading:{
    textAlign:'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
  },
  headingContainer:{
    padding:12,
    marginHorizontal: 9,
    borderRadius: 10,
  }
});

export default PrivacyPolicy;
