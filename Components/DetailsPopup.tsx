import React from 'react';
import { StyleSheet, Modal, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import IconButton from './IconButton';

interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  data_evento: string;
  organizzatore: string;
  partecipanti: number;
  organizzatori: string;
  immagine_path: string;
}

//Viene definita l'interfaccia specificante le props del popup di dettagli.
interface DetailsPopupProps {
  modalVisible: boolean; //Check per la visibilità del popup.
  chiudiPopup: () => void; //Metodo intrinseco di chiusura.
  item: Evento; //Item di tipo evento utile a ricevere i dettagli dell'evento da mostrare.
}

//Definizione del funciton component DetailsPopup.
const DetailsPopup: React.FC<DetailsPopupProps> = ({ modalVisible, chiudiPopup, item }) => {
  const imageSource = item.immagine_path ? { uri: `file://${item.immagine_path}` } : require('./imgs/Nyx_icon.jpg');

  //Costruzione del componente.
  return (
    <SafeAreaView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={chiudiPopup}
      >
        <TouchableWithoutFeedback onPress={chiudiPopup}>
          <View style={styles.modalBackground}>
            <View style={styles.popup}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                onTouchStart={() => Keyboard.dismiss()}
              >
                <TouchableOpacity activeOpacity={1}>
                    <Text style={styles.eventTitlePopup}>{item.titolo}</Text>
                    <Image
                      style={styles.eventImagePopup}
                      source={imageSource}
                      onError={(error) => console.log('Errore caricamento immagine', error.nativeEvent.error)}
                    />
                    <View style={styles.eventInfosContainerPopup}>
                      <Text style={styles.eventDatePopup}>Data: {item.data_evento}</Text>
                      <Text style={styles.eventDescriptionPopup}>Descrizione: {item.descrizione}</Text>
                      <Text style={styles.eventOrganizerPopup}>Organizzatore: {item.organizzatori}</Text>
                      <IconButton buttonStyle={styles.eventPartecipantsIcon} iconName='people-outline' iconSize={25} iconColor={'#050d25'} onPress={() => {}} />
                      <Text style={styles.eventParticipantsPopup}>Partecipanti: {item.partecipanti}</Text>
                    </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#f5ebcf',
    padding: 20,
    borderRadius: 20,
    width: '90%',
    height: '60%',
    pointerEvents: 'auto',
  },
  eventImagePopup: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  eventTitlePopup: {
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 10,
    color: '#050d25',
  },
  eventInfosContainerPopup: {
    marginTop: 20,
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
  },
  eventParticipantsPopup: {
    fontSize: 16,
    color: '#050d25',
    alignSelf: 'flex-end',
  },
  eventPartecipantsIcon: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default DetailsPopup;
