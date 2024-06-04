import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Text, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker'
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';


SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });


const EventController = ({ evento }) => {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [capacityValue, setCapacityValue] = useState(null);
  const [dateFlag, setDateFlag] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(10);
  const navigation = useNavigation();

  useEffect(() => {
    const selectEvent = async () => {
      try {
        const db = await dbPromise;
        const results = await db.executeSql(`
            SELECT *
            FROM evento
            WHERE id = ?`, [evento.id]
        );
        if (results.length > 0 && results[0].rows.length > 0) {
          const evento = results[0].rows.item(0);
          setTitleValue(evento.titolo);
          setDescriptionValue(evento.descrizione);
          setDateFlag(true);
          setDate(new Date(evento.data_evento));
          alert(`Evento Selezionato:\nTitolo: ${titleValue} \nDescrizione: ${descriptionValue} \nData: ${date}`);
        }
      } catch (error) {
        console.log(error);
        alert("Errore nell'inserimento dell'evento");
      }
    };
    if (evento !== null) {
      selectEvent();
    }
  }, [evento]);

  const handleTitleChange = (text) => {
    setTitleValue(text);

  }

  const handleDescriptionChange = (text) => {
    setDescriptionValue(text);
  }

  const handleCapacityChange = (text) => {
    setCapacityValue(text);
  }

  const handleUndoInsert = () => {
    setTitleValue('');
    setDescriptionValue('');
    setDateFlag(false);
    alert('Inserimento evento annullato');
    navigation.navigate('Account');
  }

  const handleDeleteEvent = async () => {
    try {
      const db = await dbPromise;
      const results = await db.executeSql(`
                DELETE
                FROM evento
                WHERE id = ?`, [evento.id]
      );
      alert(`Evento cancellato correttamente`);
      navigation.navigate('Account');
    } catch (error) {
      console.log(error);
      alert("Errore nella cancellazione dell'evento");
    }
  }

  const handleImagePicker = () => {
    ImagePicker.openPicker({
      width: 150,
      height: 150,
      cropping: true,
    })
       .then(async (image) => {
              const imageName = `img_${Date.now()}.jpg`;
              const destDir = `${RNFS.DocumentDirectoryPath}/Locandine`;
              const destPath = `${destDir}/${imageName}`;

              try {
                // crea la directory se non esiste
                await RNFS.mkdir(destDir);

                // copia il file dell'immagine selezionata nella directory di destinazione
                await RNFS.copyFile(image.path, destPath);

                // imposta l'URI dell'immagine selezionata
                setSelectedImageURI({ uri: `file://${destPath}` });
                setImagePath(destPath);
              } catch (error) {
                console.log(error);
              }
       });
  };

   const handleAddEvent = async () => {
      try {
        const organizzatore = await AsyncStorage.getItem('@email');
        if (organizzatore !== null) {
          const db = await dbPromise;
          await db.executeSql(
            'INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, capienza) VALUES (?, ?, ?, ?, ?)',
            [titleValue, descriptionValue, date, organizzatore, capacityValue]
          );
          alert(`Inserimento:\nTitolo: ${titleValue} \nDescrizione: ${descriptionValue} \nData: ${date} \nOrganizzatore: ${organizzatore} \nCapienza: ${capacityValue}`);
        } else {
          console.log("Errore nell'acquisizione dati da AsyncStorage");
          alert("Errore: Organizzatore non trovato");
        }
      } catch (error) {
        console.log(error);
        alert("Errore: Verifica di aver inserito tutti i campi");
      }
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
              placeholder="Aggiungi un titolo"
            />
            <TextInput
              style={[styles.input]}
              multiline
              value={descriptionValue}
              onChangeText={handleDescriptionChange}
              placeholder="Aggiungi una descrizione"
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
              title="Seleziona data dell'evento"
              buttonColor='purple'
              minuteInterval={5}
              onConfirm={(date) => {
                setModalVisible(false)
                setDateFlag(true)
                setDate(date)
              }}
              onCancel={() => {
                setModalVisible(false)
              }}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.input}>
                {dateFlag ? date.toLocaleDateString() : "Aggiungi data"}
              </Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                keyboardType='numeric'
                placeholder="Inserisci capienza massima"
                value={capacityValue}
                onChangeText={handleCapacityChange}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleAddEvent}>
              <Text style={styles.eventButton}>{ evento ? 'Modifica' : 'Inserisci'}</Text>
            </TouchableOpacity>
            {evento ? (<TouchableOpacity onPress={handleDeleteEvent}>
              <Icon name='delete' style={[styles.eventButton, styles.deleteButton]}></Icon>
            </TouchableOpacity>) : null}
            <TouchableOpacity onPress={handleUndoInsert}>
              <Text style={styles.eventButton}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

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
    marginVertical: 10,
    padding: 5,
  },

  largeInput: {
    height: 100,
    textAlignVertical: 'top',
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
    padding: 10,
    marginTop: 10,
  },

  deleteButton: {
    fontSize: 25,
    alignItems: 'center',
  }

});

export default EventController;