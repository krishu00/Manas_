import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/AntDesign';


const MoreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>More</Text>
      <Text style={styles.paragraph}>
        Explore more options and settings here. Customize your experience, access additional features, and learn more about 
        how you can make the most of the app.
      </Text>

<Icon name="delete" size={50}/>
<Text> jnasjd</Text>
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black'
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
