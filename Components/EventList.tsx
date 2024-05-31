import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, TouchableWithoutFeedback, Animated, TouchableOpacity, Button, ViewStyle, StyleProp } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DetailsPopup from './DetailsPopup';  // Assicurati che il percorso sia corretto
import PartecipantAdderPopup from './PartecipantAdderPopup';
import IconButton from './IconButton';


// Definisco l'evento
interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  date: string;
  organizzatore: string;
  partecipanti: number;
}

// CREA IL DB
SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

// LEGGE GLI EVENTI
const leggiEvento = async (): Promise<Evento[]> => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql('SELECT * FROM evento');
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

interface ZoomableViewProps {
    children: React.ReactNode;
    onPress: () => void;
    viewStyle?: StyleProp<ViewStyle>
  }

const ZoomableView: React.FC<ZoomableViewProps> = ({ children, onPress, viewStyle}) => {
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
    <TouchableWithoutFeedback style={viewStyle} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[{ transform: [{ scale }]}, viewStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [selectedEventEventDetails, setSelectedEventEventDetails] = useState<Evento | null>(null);
  const [modalVisibleEventDetails, setModalVisibleEventDetails] = useState<boolean>(false);
  const [selectedEventUserInsert, setSelectedEventUserInsert] = useState<Evento | null>(null);
  const [modalVisibleUserInsert, setModalVisibleUserInsert] = useState<boolean>(false);

  useEffect(() => {
    leggiEvento()
      .then((data) => {
        if (data) {
          setEvents(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleEventPressEventDetails = (item: Evento) => {
    setSelectedEventEventDetails(item);
    setModalVisibleEventDetails(true);
  };

  const handleEventPressUserInsert = (item: Evento) => {
    setSelectedEventUserInsert(item);
    setModalVisibleUserInsert(true);
  };

  const renderItem = ({ item }: { item: Evento }) => (
    <ZoomableView viewStyle={styles.zoomableViewEventsContainer} onPress={() => handleEventPressEventDetails(item)}>
        <View style={styles.eventContainer}>
        <IconButton buttonStyle={styles.eventAddpersonIcon} iconName='person-add-outline' iconSize={25} onPress={() => handleEventPressUserInsert(item)}></IconButton>
          <View>
            <Image style={styles.eventIconImg} source={require('./imgs/Artboard_Copy_231.jpg')} />
          </View>
          <View style={styles.eventInfosContainer}>
            <Text style={styles.eventTitle}>{item.titolo}</Text>
            <Text style={styles.eventDate}>Data: {item.date}</Text>
            <Text style={styles.eventOrganizer}>Organizzatore: {item.organizzatore}</Text>
            <Text style={styles.eventParticipants}>{item.partecipanti}</Text>
          </View>
        </View>
    </ZoomableView>
  );

  const chiudiPopup = () => {
    setModalVisibleEventDetails(false);
    setSelectedEventEventDetails(null);
  };

  const chiudiPopupUserInsert = () => {
    setModalVisibleUserInsert(false);
    setSelectedEventUserInsert(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      {selectedEventEventDetails && (
        <DetailsPopup
          modalVisible={modalVisibleEventDetails}
          chiudiPopup={chiudiPopup}
          item={selectedEventEventDetails}
        />
      )}
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
    top: 50,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#050d25',
    padding: 20,
  },
  zoomableViewEventsContainer: {

  },
  eventContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderColor: '#631d47',
    borderWidth: 5,
    backgroundColor: '#d9d9d9',
    margin: 10,
    padding: 10,
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
    color: '#2F2F2F',
  },
  eventDate: {
    flex: 1,
    fontWeight: 'bold',
    top: 5,
    fontSize: 16,
    color: '#2F2F2F',
  },
  eventOrganizer: {
    flex: 1,

    fontSize: 16,
    color: '#2F2F2F',
  },
  eventParticipants: {
    fontSize: 16,
    alignSelf: 'flex-end',
    color: '#2F2F2F',
    fontWeight: 'bold',
  },
  eventAddpersonIcon: {
    position: 'absolute', 
    bottom: 80,
    right: 5, 
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventList;
