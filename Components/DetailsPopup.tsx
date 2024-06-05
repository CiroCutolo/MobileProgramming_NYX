import React, { useEffect, useState } from 'react';
import { StyleSheet, Modal, Text, View, SafeAreaView, Keyboard, TouchableWithoutFeedback, Image, Dimensions, PixelRatio } from 'react-native';
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

const { width, height } = Dimensions.get('window');
const scale = width / 375;

function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
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
          <View style={styles.view1}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.popup}>
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
                    <IconButton buttonStyle={styles.eventPartecipantsIcon} iconName='people-outline' iconSize={25} iconColor={'#050d25'} onPress={function (): void {} } />
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
    padding: normalize(20),
    borderRadius: normalize(20),
    width: width * 0.9,
    alignContent: 'center',
    height: height * 0.7,
  },
  eventImagePopup: {
    width: width * 0.8,
    height: height * 0.2,
    borderRadius: normalize(10),
    alignSelf: 'center',
  },
  eventTitlePopup: {
    fontWeight: 'bold',
    fontSize: normalize(18),
    alignSelf: 'center',
    marginBottom: normalize(10),
    color: '#050d25',
  },
  eventInfosContainerPopup: {
    top: normalize(20),
  },
  eventDatePopup: {
    fontSize: normalize(16),
    marginBottom: normalize(10),
    color: '#050d25',
  },
  eventDescriptionPopup: {
    fontSize: normalize(16),
    marginBottom: normalize(10),
    color: '#050d25',
  },
  eventOrganizerPopup: {
    fontSize: normalize(16),
    marginBottom: normalize(10),
    color: '#050d25',
    top: height * 0.3,
  },
  eventParticipantsPopup: {
    fontSize: normalize(16),
    color: '#050d25',
    alignSelf: 'flex-end',
    top: height * 0.3,
  },
  eventPartecipantsIcon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: height * 0.4,
  },
});

export default DetailsPopup;