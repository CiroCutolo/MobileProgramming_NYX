import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({name: 'nyx.db', location: 'default'});

const EventController = () => {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateFlag, setDateFlag] = useState(false);

  const handleTitleChange = (text) => setTitleValue(text);
  const handleDescriptionChange = (text) => setDescriptionValue(text);

  const handleUndoInsert = () => {
    setTitleValue('');
    setDescriptionValue('');
    setDateFlag(false);
    Alert.alert('Inserimento evento annullato');
  }

  const handleImagePicker = () => {
    ImagePicker.openPicker({ //stabilisce le dimensioni fisse delle mmagini da salvare nel db
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
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddEvent = async () => {
    try {
      const db = await dbPromise;
      const ISOdate = date.toISOString();
      await db.executeSql(
        'INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, capienza, immagine_path) VALUES (?, ?, ?, ?, ?, ?)',
        [titleValue, descriptionValue, ISOdate, 'Auri', 100, imagePath]
      );
      Alert.alert(`Inserimento:\nTitolo: ${titleValue} \nDescrizione: ${descriptionValue} \nData: ${ISOdate}`);
    } catch (error) {
      console.log(error);
      Alert.alert("Errore nell'inserimento dell'evento");
    }
  };

  return (
    <View style={styles.container}>
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
            style={[styles.input, styles.largeInput]}
            multiline
            value={descriptionValue}
            onChangeText={handleDescriptionChange}
            placeholder="Aggiungi una descrizione"
          />
          <DatePicker
            modal
            mode="datetime"
            open={modalVisible}
            date={date}
            minimumDate={new Date(Date.now())}
            locale='it'
            theme="dark"
            title="Seleziona data e ora dell'evento"
            buttonColor='purple'
            minuteInterval={5}
            onConfirm={(date) => {
              setModalVisible(false);
              setDateFlag(true);
              setDate(date);
            }}
            onCancel={() => setModalVisible(false)}
          />
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.input}>
              {dateFlag ? date.toLocaleString().substring(0, date.toLocaleString().indexOf(':') + 3) : "Aggiungi data"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleAddEvent}>
            <Text style={styles.eventButton}>Inserisci</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUndoInsert}>
            <Text style={styles.eventButton}>Annulla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    width: '100%',
    height: '100%',
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
    borderRadius: 10,
    marginVertical: 10,
    padding: 5,
    backgroundColor: '#edf6d6',
    color: 'black'
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
});

export default EventController;
