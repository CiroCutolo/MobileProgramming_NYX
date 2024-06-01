import React from 'react';
import { Button, StyleSheet, Modal, Text, View, SafeAreaView, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';

export default function Popup({ modalVisible, chiudiPopup }) {
const navigation= useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={chiudiPopup}
      >
        <TouchableWithoutFeedback onPress={chiudiPopup}>
          <View style={styles.view1}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.popup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={chiudiPopup}>
                    <Text style={styles.buttonText}>Accedi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      chiudiPopup();
                      navigation.navigate('Registrazione');
                    }}
                  >
                    <Text style={styles.buttonText}>Registrati</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a3358',
  },
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#917ea3',
    padding: 20,
    borderRadius: 10,
    width: 350,
    height: 250,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: '#917ea3',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#edf6d6',
    fontSize: 15,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4a3358',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
