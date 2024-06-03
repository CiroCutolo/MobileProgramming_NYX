import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, Button, TouchableOpacity, Modal, Pressable, Text, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker'
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({name: 'nyx.db', location: 'default'});


const App = () => {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateFlag, setDateFlag] = useState(false);

  const handleTitleChange = (text) => {
    setTitleValue(text);
  }

  const handleDescriptionChange = (text) => {
      setDescriptionValue(text);
  }

  const handleUndoInsert = () => {
      setTitleValue('');
      setDescriptionValue('');
      setDateFlag(false);
      alert('Evento inserito correttamente');
  }

  const handleImagePicker = () => {
    ImagePicker.openPicker({
      width: 150,
      height: 150,
      cropping: true,
    })
      .then((image) => {
        setSelectedImage({ uri: image.path });
        console.log("Immagine aggiunta correttamente");
      })
      .catch((error) => {
        console.log(error);
        alert("Errore nell'inserimento dell'imagine");
      });
  };

      const handleAddEvent = async () => {
          try {
            const db = await dbPromise;
            const ISOdate = date.toISOString();
            await db.executeSql('INSERT INTO evento (titolo, descrizione, date) VALUES (?, ?, ?)', [titleValue, descriptionValue, ISOdate]);
            alert(`Inserimento:\nTitolo: ${titleValue} \nDescrizione: ${descriptionValue} \nData: ${ISOdate}`);
          } catch (error) {
            console.log(error);
            alert("Errore nell'inserimento dell'evento");
          }
        };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <TouchableOpacity onPress={handleImagePicker}>
          <View style={styles.profileImageContainer}>
            {selectedImage ? (
              <Image source={selectedImage} style={{ width: 150, height: 150 }} />
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
            placeholder="Aggiungi una descrizione" />
          <DatePicker
            modal
            mode="datetime"
            open={modalVisible}
            date={date}
            minimumDate= {new Date(Date.now())}
            locale='it'
            theme="dark"
            title="Seleziona data e ora dell'evento"
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
    backgroundColor: 'lightgrey',
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
    borderRadius: 5,
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
    backgroundColor: '#f194ff',
    color: 'white',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

});

export default App