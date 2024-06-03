import React, { useEffect, useState } from 'react';
import IconButton from './IconButton';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, TouchableWithoutFeedback, Animated } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import PartecipantAdderPopup from './PartecipantAdderPopup';

// Definisco l'evento
interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  data_evento: string;
  organizzatore: string;
  capienza: number;
}

// CREA IL DB
SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

// LEGGE GLI EVENTI
const leggiEvento = async (): Promise<Evento[]> => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql(`
      SELECT * FROM evento
      WHERE data_evento >= date('now', '-10 days')
      AND data_evento <= date('now', '+10 days')
    `);
    if (results.length > 0) {
      const rows = results[0].rows;
      const events: Evento[] = [];
      for (let i = 0; i < rows.length; i++) {
        events.push(rows.item(i));
      }
      return events;
    }
    return [];
  } catch (error) {
    console.error('Errore nella lettura degli eventi', error);
    return [];
  }
};

interface Partecipanti {
  evento_id: number;
  partecipazioni: number;
}

// Conta le partecipazioni per ogni evento
const leggiPartecipanti = async (): Promise<Partecipanti[]> => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql(`
      SELECT E.id as evento_id, COUNT(P.id) as partecipazioni
      FROM evento E
      LEFT JOIN partecipazione P ON E.id = P.evento_id
      GROUP BY E.id
    `);
    if (results.length > 0) {
      const rows = results[0].rows;
      const numeroPartecipanti: Partecipanti[] = [];
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        numeroPartecipanti.push({
          evento_id: item.evento_id,
          partecipazioni: item.partecipazioni,
        });
      }
      return numeroPartecipanti;
    }
    return [];
  } catch (error) {
    console.error('Errore nel recuperare i dati sugli eventi:', error);
    return [];
  }
};

const HomeEventList: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [partecipanti, setPartecipanti] = useState<Partecipanti[]>([]);
  const [selectedEventUserInsert, setSelectedEventUserInsert] = useState<Evento | null>(null);
  const [modalVisibleUserInsert, setModalVisibleUserInsert] = useState<boolean>(false);
  const [result, setResult] = useState('');

  const aggiungiEvento = async () => {
    try {
      const db = await dbPromise;
      await db.executeSql('INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, capienza ) VALUES (?, ?, ?, ?, ?)', ['FestaDrogante', 'In questa festa non ci si droga', '2024-06-01', 'Pippo Baudo', 30]);
      setResult('Aggiunto ');
      // Re-fetch degli eventi dopo aver aggiunto uno nuovo
      const updatedEvents = await leggiEvento();
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'evento', error);
      setResult('Errore nell\'aggiungere l\'evento.');
    }
  };

  useEffect(() => {
    leggiEvento()
      .then((data) => {
        if (data) {
          setEvents(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    // Recupera il numero di partecipanti
    leggiPartecipanti()
      .then((data) => {
        if (data) {
          setPartecipanti(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleEventPressUserInsert = (item: Evento) => {
    setSelectedEventUserInsert(item);
    setModalVisibleUserInsert(true);
  };

  const handleAddEventPress = () => {
    navigation.navigate('EventController');
  };

  const renderItem = ({ item }: { item: Evento }) => {
    const partecipazioni = partecipanti.find(p => p.evento_id === item.id)?.partecipazioni || 0;
    const eventoDate = new Date(item.data_evento);
    const isPastEvent = eventoDate < new Date();

    return (
      <ZoomableView>
        <View style={styles.eventContainer}>
          <IconButton buttonStyle={styles.eventAddpersonIcon} iconName='person-add-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => handleEventPressUserInsert(item)} />
          <View>
            <Image style={styles.eventIconImg} source={require('./imgs/Nyx_icon.jpg')} />
          </View>
          <View style={styles.eventInfosContainer}>
            <Text style={styles.eventTitle}>{item.titolo}</Text>
            <Text style={styles.eventDate}>Data: {item.data_evento}</Text>
            <Text style={styles.eventOrganizer}>Organizzatore: {item.organizzatore}</Text>
            <Text style={styles.eventParticipants}>Numero atteso: {item.capienza}</Text>
            { isPastEvent && (
            <Text style={styles.eventParticipants}>Numero finale: {partecipazioni}</Text>
            )}
            { !isPastEvent && (
            <Text style={styles.eventParticipants}>Numero attuale: {partecipazioni}</Text>
            )}
          </View>
        </View>
      </ZoomableView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
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
    flexDirection: 'column',
    backgroundColor: '#050d25',
    alignContent: 'space-evenly',
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
  eventOrganizer: {
    flex: 1,
    fontSize: 16,
    color: '#D9D9D9',
  },
  eventParticipants: {
    fontSize: 16,
    color: '#D9D9D9',
  },
  eventAddpersonIcon: {
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
    backgroundColor: '#050d25',
    elevation: 4,
    zIndex: 1
  }
});

export default HomeEventList;
