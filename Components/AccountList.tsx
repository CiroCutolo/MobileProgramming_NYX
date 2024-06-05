import React, { useEffect, useState } from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, TouchableWithoutFeedback, Animated } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import PartecipantAdderPopup from './PartecipantAdderPopup';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  data_evento: string;
  organizzatore: string;
  partecipanti: number;
}

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

const AccountList = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [selectedEventUserInsert, setSelectedEventUserInsert] = useState<Evento | null>(null);
  const [modalVisibleUserInsert, setModalVisibleUserInsert] = useState(false);
  const navigation = useNavigation();
  const [imageExists, setImageExists] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    leggiEvento()
      .then((data) => {
        if (data) {
          setEvents(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const leggiEvento = async (): Promise<Evento[]> => {
    try {
      const utente = await AsyncStorage.getItem('@email');
      if (utente !== null) {
        const db = await dbPromise;
        const results = await db.executeSql(
          `SELECT *
            FROM evento
            WHERE organizzatore = ?`, [utente]);
        if (results.length > 0) {
          const rows = results[0].rows;
          const events: Evento[] = [];
          for (let i = 0; i < rows.length; i++) {
            events.push(rows.item(i));
          }
          return events;
        }
        return [];
      } else {
        console.log("Errore nell'acquisizione dati da AsyncStorage");
        alert("Errore: Organizzatore non trovato");
      }
    } catch (error) {
      console.error('Errore nella lettura degli eventi', error);
      return [];
    }
  };

  const update = async () => {
    try {
      const updateEvents = await leggiEvento();
      setEvents(updateEvents)
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    update();
  }, []);

  useEffect(() => {
    events.forEach((event) => {
      if (event.immagine_path) {
        const filePath = `file://${event.immagine_path}`;
        RNFS.exists(filePath)
          .then(exists => {
            setImageExists(prevState => ({
              ...prevState,
              [event.id]: exists,
            }));
          })
          .catch(error => console.log('Errore verifica immagine', error));
      }
    });
  }, [events]);

  const handleEventPressUserInsert = (item: Evento) => {
    setSelectedEventUserInsert(item);
    setModalVisibleUserInsert(true);
  };

  const handleEventPressModEvent = (item: Evento) => {
    navigation.navigate('Aggiungi', { evento: item });
  };

  const logout = async () => {
    console.log('Eseguendo il logout');
    try {
        await AsyncStorage.removeItem('@email');
        console.log('Email rimossa con successo');
        navigation.navigate('Home');
    } catch (error) {
        console.error('Logout fallito', error);
    }
  }

  const renderItem = ({ item }: { item: Evento }) => {
    const imageSource = imageExists[item.id] ? { uri: `file://${item.immagine_path}` } : require('./imgs/Nyx_icon.jpg');
    return(
    <View style={styles.eventContainer}>
      <View style={styles.iconContainer}>
        <IonIcons name='create-outline' size={28} color={'#D9D9D9'} onPress={() => handleEventPressModEvent(item)} />
        <IonIcons name='person-add-outline' size={25} color={'#D9D9D9'} onPress={() => handleEventPressUserInsert(item)} />
      </View>
      <View>
        <Image
          style={styles.eventIconImg}
            source={imageSource}
            onError={(error) => console.log('Errore caricamento immagine', error.nativeEvent.error)}
          />
      </View>
        <View style={styles.eventInfosContainer}>
          <Text style={styles.eventTitle}>{item.titolo}</Text>
          <Text style={styles.eventDate}>Data: {item.data_evento}</Text>
          <Text style={styles.eventParticipants}>{item.partecipanti}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerButton}>
        <MaterialIcons name='logout' color={'#D9D9D9'} onPress={logout} size={40}/>
        <FontAwesome name='refresh' color={'#D9D9D9'} onPress={update} size={35}/>
      </View>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onScroll={() => update()}
      />
      {selectedEventUserInsert && (
        <PartecipantAdderPopup
          modalVisible={modalVisibleUserInsert}
          chiudiPopup={() => setModalVisibleUserInsert(false)}
          eventoId={selectedEventUserInsert.id}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#050d25',
    alignContent: 'space-evenly',
    padding: '2%',
  },

  containerButton: {
    marginHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  eventContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderColor: '#050d25',
    borderWidth: 5,
    backgroundColor: '#050d25',
    margin: 10,
    padding: 10,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  eventIconImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    marginRight: 10,
  },
  eventInfosContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  eventTitle: {
    flex: 1,
    fontWeight: 'bold',
    top: 10,
    fontSize: 16,
    color: '#D9D9D9',
  },
  eventDate: {
    flex: 1,
    fontWeight: 'bold',
    top: 5,
    fontSize: 16,
    color: '#D9D9D9',
  },
  eventParticipants: {
    fontSize: 16,
    alignSelf: 'flex-end',
    color: '#D9D9D9',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    right: 5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountList;
