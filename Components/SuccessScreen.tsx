import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface SuccessPopupProps {
    visible: boolean;
    chiudiPopup: () => void;
    success: boolean,
  }
  

const SuccessPopup: React.FC<SuccessPopupProps> = ({ visible, chiudiPopup, success }) => {

  return (
    <Modal transparent visible={visible} onRequestClose={chiudiPopup}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.message}>{success
              ? 'La tua prenotazione è andata a buon fine!'
              : 'La tua prenotazione non è andata a buon fine, controlla i campi inseriti.'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={chiudiPopup}>
            <Text style={styles.closeButtonText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  closeButton: {
    backgroundColor: '#4a3358',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SuccessPopup;
