import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import DatePicker from 'react-native-date-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';

//crea una connessione (incapsulata in una Promise) verso il database
SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

const EventController = ({ evento }) => {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [capacityValue, setCapacityValue] = useState('');
  const [dateFlag, setDateFlag] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(10);
  const navigation = useNavigation();

  //React Hook che ti consente di sincronizzare un componente con un sistema esterno
  useEffect(() => {
    //se è stato passato un oggetto evento come routeParams precompila i campi per consentirne la modifica
    if (evento) {
      setTitleValue(evento.titolo);
      setDescriptionValue(evento.descrizione);
      setDateFlag(true);
      setDate(new Date(evento.data_evento));
      setCapacityValue(evento.capienza ? evento.capienza.toString() : '');
      //essendo l'immagine un attributo facoltativo effettuo un controllo specifico su di essa
      if (evento.immagine_path) {
        setSelectedImageURI({ uri: `file://${evento.immagine_path}` });
        setImagePath(evento.immagine_path);
      }
    }
  }, [evento]);

  //gestisce il cambiamento del TextInput relativo al titolo
  const handleTitleChange = (text) => {
    setTitleValue(text);
  };

  //gestisce il cambiamento del TextInput relativo alla descrizione
  const handleDescriptionChange = (text) => {
    setDescriptionValue(text);
  };

  //gestisce il cambiamento del TextInput relativo alla capacità massima
  const handleCapacityChange = (text) => {
    setCapacityValue(text);
  };

  //gestisce la cancellazione dei campi dopo l'annullamento di un operazione di modifica/inserimento
  const handleUndoInsert = () => {
    handleEmptyFields();
    alert('Inserimento evento annullato');
    //funzione di navigazione: naviga l'utente alla schemata Account
    navigation.navigate('Account');
  };

  //gestisce la cancellazione di un evento
  const handleDeleteEvent = async () => {
    try {
      const db = await dbPromise; //connessione al db
      //esecuzione query
      const results = await db.executeSql(`
        DELETE
        FROM evento
        WHERE id = ?`, [evento.id]
      );
      alert('Evento cancellato correttamente');
      //navigazione alla schemata Account
      navigation.navigate('Account');
    } catch (error) {
      console.error(error);
      alert('Errore nella cancellazione dell\'evento');
    }
  };

  //gestisce aggiunta evento
  const handleAddEvent = async () => {
    try {
      //recupera l'email dell'utente/organizzatore dal localstorage
      const organizzatore = await AsyncStorage.getItem('@email');
      if (organizzatore) {
        const db = await dbPromise; //connessione db
        const dateString = date.toISOString().split('T')[0]; //formatta stringa
        //verifica se è stato passato evento tramite routeParam --> operazione di modifica
        if (evento) {
          //esecuzione query
          await db.executeSql(
            'UPDATE evento SET titolo = ?, descrizione = ?, data_evento = ?, capienza = ?, immagine_path = ? WHERE id = ?',
            [titleValue, descriptionValue, dateString, capacityValue, imagePath, evento.id]
          );
          alert('Evento aggiornato correttamente');
          //altrimenti --> operazione di inserimento
        } else {
          //esecuzione query
          await db.executeSql(
            'INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, capienza, immagine_path) VALUES (?, ?, ?, ?, ?, ?)',
            [titleValue, descriptionValue, dateString, organizzatore, capacityValue, imagePath]
          );
          alert('Evento inserito correttamente');
        }

        handleEmptyFields(); //svuota campi
        navigation.navigate('Account'); //navigazione alla schemrata Account
      } else {
        console.error('Errore nell\'acquisizione dati da AsyncStorage');
        alert('Errore: Organizzatore non trovato');
      }
    } catch (error) {
      console.error(error);
      alert('Errore: Verifica di aver inserito tutti i campi');
    }
  };

  //gestione svuotamento campi
  const handleEmptyFields = () => {
    setTitleValue(''); //svuota TextInput titolo
    setDescriptionValue(''); //svuota TextInput descrizione
    setCapacityValue(''); //svuota TextInput capienza
    setDateFlag(false); //svuota TextInput dataevento
    setSelectedImageURI(null); // Svuota lo stato dell'immagine
    setImagePath(''); // Svuota il percorso dell'immagine
  };

  //gestione inserimento immagine
  const handleImagePicker = () => {
    //apre la galleria dell'utente per consentire la selezione, determinando le proprietà dell'img
    ImagePicker.openPicker({
      width: 150,
      height: 150,
      cropping: true, //consente di ritagliare l'immagine prima di confermare la selezione
      //gestione del risultato della selzione
    }).then(async (image) => {
      const imageName = `img_${Date.now()}.jpg`; //nome univoco che utilizza la data di inserimento
      const destDir = `${RNFS.DocumentDirectoryPath}/Locandine`; //percorso cartella di destinazione
      const destPath = `${destDir}/${imageName}`; //crea percorso di destinazione = cartella + nome file

      try {
        await RNFS.mkdir(destDir); //crea la cartella di destinazione se non esiste
        await RNFS.copyFile(image.path, destPath); //copia il file immagine (tramite path) nella cartella destinazione
        setSelectedImageURI({ uri: `file://${destPath}` }); //imposta lo stato per visualizzare l'img tramite uri
        setImagePath(destPath); //imposta il path didestinazione dello stato
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <View style={styles.body}>
          <TouchableOpacity onPress={handleImagePicker}>
            <View style={styles.profileImageContainer}>
              {selectedImageURI ? (
                <Image source={selectedImageURI} style={styles.profileImage} />
              ) : (
                <Icon name='add-a-photo' style={styles.icon_add} />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={titleValue}
              onChangeText={handleTitleChange}
              placeholder="Inserisci un titolo"
            />
            <TextInput
              style={[styles.input]}
              multiline
              value={descriptionValue}
              onChangeText={handleDescriptionChange}
              placeholder="Inserisci una descrizione"
              onContentSizeChange={(e) => setDescriptionHeight(e.nativeEvent.contentSize.height)}
            />
            <DatePicker
              modal
              mode="date"
              open={modalVisible}
              date={date}
              minimumDate={new Date(Date.now())}
              locale='it'
              theme="dark"
              title="Seleziona la data dell'evento"
              buttonColor='purple'
              onConfirm={(date) => {
                setModalVisible(false);
                setDateFlag(true);
                setDate(date);
              }}
              onCancel={() => {
                setModalVisible(false);
              }}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <TextInput style={styles.input}
              placeholder="Seleziona la data dell'evento"
              value={dateFlag ? date.toLocaleDateString('it-IT') : ""}
              editable={false}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              placeholder="Inserisci la capienza massima"
              value={capacityValue}
              onChangeText={handleCapacityChange}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleAddEvent}>
              <Text style={styles.eventButton}>{evento ? 'Modifica' : 'Inserisci'}</Text>
            </TouchableOpacity>
            {evento ? (
              <TouchableOpacity onPress={handleDeleteEvent}>
                <Icon name='delete' style={[styles.eventButton, styles.deleteButton]} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={handleUndoInsert}>
              <Text style={styles.eventButton}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d25',
  },
  body: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: '5%',
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    overflow: 'hidden',
    borderRadius: 100,
    backgroundColor: '#edf6d6',
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
  },
  icon_add: {
    fontSize: 80,
    color: 'black',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#edf6d6',
    color: 'black',
    borderRadius: 10,
    marginVertical: '3%',
    padding: '1.5%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  eventButton: {
    backgroundColor: '#917ea3',
    color: 'white',
    borderRadius: 10,
    padding: '3.5%',
    marginTop: '10%',
  },
  deleteButton: {
    fontSize: 25,
    alignItems: 'center',
  }
});

export default EventController;
