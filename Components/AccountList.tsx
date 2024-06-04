import React, { useEffect, useState } from 'react';
import IconButton from './IconButton';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, TouchableWithoutFeedback, Animated } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import PartecipantAdderPopup from './PartecipantAdderPopup';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';


// Definisco l'evento
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
  const [result, setResult] = useState('');
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

  //controlla se l'immagine esiste
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
    navigation.navigate('Aggiungi', { evento: item});
  };


  const renderItem = ({ item }: { item: Evento }) => {
    const imageSource = imageExists[item.id] ? { uri: `file://${item.immagine_path}` } : require('./imgs/Nyx_icon.jpg');
    return(
    <View style={styles.eventContainer}>
      <View style={styles.iconContainer}>
        <IconButton iconName='create-outline' iconSize={28} iconColor={'#D9D9D9'} onPress={() => handleEventPressModEvent(item)} />
        <IconButton iconName='person-add-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => handleEventPressUserInsert(item)} />
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

const ZoomableView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#050d25', // Viola estremamente scuro
    alignContent: 'space-evenly',
  },

  eventContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderColor: '#050d25', // Viola leggermente più scuro
    borderWidth: 5,
    backgroundColor: '#050d25', // Viola leggermente più scuro
    margin: 10,
    padding: 10,
    shadowColor: '#FFFFFF', // Colore bianco per l'ombreggiatura
    shadowOffset: { width: 8, height: 8 }, // Ombreggiatura solo in basso
    shadowOpacity: 0.8,
    shadowRadius: 5, // Aumenta il raggio per un'ombreggiatura più morbida
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
    color: '#D9D9D9', // Grigio chiaro per contrasto con il testo
  },
  eventDate: {
    flex: 1,
    fontWeight: 'bold',
    top: 5,
    fontSize: 16,
    color: '#D9D9D9', // Grigio chiaro per contrasto con il testo
  },
  eventOrganizer: {
    flex: 1,
    fontSize: 16,
    color: '#D9D9D9', // Grigio chiaro per contrasto con il testo
  },
  eventParticipants: {
    fontSize: 16,
    alignSelf: 'flex-end',
    color: '#D9D9D9', // Grigio chiaro per contrasto con il testo
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

  buttonAddEventStyle: {
    position: 'absolute',
    right: 25,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050d25'
  }
});

export default AccountList;
