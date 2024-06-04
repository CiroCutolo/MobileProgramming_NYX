import React from 'react';
import { StyleSheet, Modal, Text, View, SafeAreaView, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import IconButton from './IconButton';

interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  data_evento: string;
  organizzatore: string;
  partecipanti: number;
  organizzatori: string;
}

interface DetailsPopupProps {
  modalVisible: boolean;
  chiudiPopup: () => void;
  item: Evento;
}

const DetailsPopup: React.FC<DetailsPopupProps> = ({ modalVisible, chiudiPopup, item }) => {
  return (
    <SafeAreaView >
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
                <Text style={styles.eventTitlePopup}>{item.titolo}</Text>
                <Image 
                  style={styles.eventImagePopup} 
                  source={require('./imgs/Nyx_icon.jpg')} 
                />
                <View style={styles.eventInfosContainerPopup}>
                    <Text style={styles.eventDatePopup}>Data: {item.data_evento}</Text>
                    <Text style={styles.eventDescriptionPopup}>Descrizione: {item.descrizione}</Text>
                    <Text style={styles.eventOrganizerPopup}>Organizzatore: {item.organizzatori}</Text>
                    <IconButton buttonStyle={styles.eventPartecipantsIcon} iconName='people-outline' iconSize={25} iconColor={'#050d25'} onPress={() => undefined} />
                    <Text style={styles.eventParticipantsPopup}>{item.partecipanti}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#f5ebcf',
    padding: 20,
    borderRadius: 20,
    width: 350,
    alignContent: 'center',
    maxHeight: 500,
  },
  eventImagePopup: {
    width: 300,
    maxHeight: 150,
    borderRadius: 10,
    alignSelf: 'center',
  },
  eventTitlePopup: {
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 10,
    color: '#050d25',
  },
  eventInfosContainerPopup: {
    top: 20
  },
  eventDatePopup: {
    fontSize: 16,
    marginBottom: 10,
    color: '#050d25',
  },
  eventDescriptionPopup: {
    fontSize: 16,
    marginBottom: 10,
    color: '#050d25',
  },
  eventOrganizerPopup: {
    fontSize: 16,
    marginBottom: 10,
    color: '#050d25',
    top: 150
  },
  eventParticipantsPopup: {
    fontSize: 16,
    color: '#050d25',
    alignSelf: 'flex-end',
    top: 145
  },
  eventPartecipantsIcon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: 60
  }
});

export default DetailsPopup;
