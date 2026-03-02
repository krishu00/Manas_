import React, { useEffect } from 'react';
import { Pressable, View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const Popup = ({ title, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [autoClose, onClose]);
  const handleOverlayPress = () => {
    onClose();
  };

  

  return (
    <Modal transparent animationType="fade"  onRequestClose={onClose}>
       <Pressable style={styles.overlay} onPress={handleOverlayPress}>
         <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
         <View style={styles.popup} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
       </View>
      </Pressable>
      </Pressable>
    </Modal>
   
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#100e0eff',
  },
  message: {
    color: '#100e0eff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4caf4fad',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Popup;
