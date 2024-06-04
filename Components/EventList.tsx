import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, TouchableWithoutFeedback, Animated, StyleProp, ViewStyle, TextInput, Modal } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DetailsPopup from './DetailsPopup';  
import PartecipantAdderPopup from './PartecipantAdderPopup';
import IconButton from './IconButton';
import { SelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventPartecipantsPopup from './EventPartecipantsPopup';

interface Evento {
  id: number;
  titolo: string;
  descrizione: string;
  data_evento: string;
  organizzatore: string;
  partecipanti: number;
  organizzatori: string;
}

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

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

const leggiNumeroPartecipanti = async () => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql(`
    SELECT P.evento_id as evento, COUNT(*) as partecipazioni
    FROM evento E
    JOIN partecipazione P ON E.id = P.evento_id
    GROUP BY P.evento_id
    `);

    if (results.length > 0) {
      const rows = results[0].rows;
      const partecipazioni: { [key: number]: number } = {};
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        partecipazioni[item.evento] = item.partecipazioni;
      }
      return partecipazioni;
    }
    return {};
  } catch (error) {
    console.error('Errore nel recuperare i dati sugli eventi:', error);
    return {};
  }
};

const leggiOrganizzatore = async () => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql(`
      SELECT E.id as evento_id, U.nome || ' ' || U.cognome as organizzatore
      FROM evento E
      JOIN utente U ON E.organizzatore = U.email
    `);

    if (results.length > 0) {
      const rows = results[0].rows;
      const organizzatori: { [key: number]: string } = {};
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        organizzatori[item.evento_id] = item.organizzatore;
      }
      return organizzatori;
    }
    return {};
  } catch (error) {
    console.error('Errore nel recuperare i dati sugli organizzatori:', error);
    return {};
  }
};

interface ZoomableViewProps {
  children: React.ReactNode;
  onPress: () => void;
  viewStyle?: StyleProp<ViewStyle>
}

const ZoomableView: React.FC<ZoomableViewProps> = ({ children, onPress, viewStyle }) => {
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
      <Animated.View style={[{ transform: [{ scale }] }, viewStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Evento[]>([]);
  const [selectedEventEventDetails, setSelectedEventEventDetails] = useState<Evento | null>(null);
  const [modalVisibleEventDetails, setModalVisibleEventDetails] = useState<boolean>(false);
  const [selectedEventUserInsert, setSelectedEventUserInsert] = useState<Evento | null>(null);
  const [modalVisibleUserInsert, setModalVisibleUserInsert] = useState<boolean>(false);
  const [selectedEventPartecipantsList, setSelectedEventPartecipantsList] = useState<Evento | null>(null);
  const [modalVisiblePartecipantsList, setModalVisiblePartecipantsList] = useState<boolean>(false);
  const [selected, setSelected] = useState("");
  const [searchText, setSearchText] = useState("");

  const data = [
    { key: '1', value: 'Evento Passato' },
    { key: '2', value: 'Evento Futuro' }
  ];

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  const handleFilter = (item: string) => {
    const currentDate = getCurrentDate();
    let filtered = events;

    if (item === 'Evento Passato') {
      filtered = filtered.filter(event => event.data_evento < currentDate);
    } else if (item === 'Evento Futuro') {
      filtered = filtered.filter(event => event.data_evento >= currentDate);
    }

    if (searchText) {
      filtered = filtered.filter(event => event.titolo.toLowerCase().includes(searchText.toLowerCase()));
    }

    setFilteredEvents(filtered);
  }

  const fetchData = async () => {
    try {
      const eventData = await leggiEvento();
      const partecipazioniEventi = await leggiNumeroPartecipanti();
      const organizzatoriEventi = await leggiOrganizzatore();

      const eventsDetails = eventData.map(event => ({
        ...event,
        partecipanti: partecipazioniEventi[event.id] || 0,
        organizzatori: organizzatoriEventi[event.id] || 'Non disponibile'
      }));

      setEvents(eventsDetails);
      setFilteredEvents(eventsDetails);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleFilter(selected);
  }, [selected, searchText, events]);

  const handleEventPressEventDetails = (item: Evento) => {
    setSelectedEventEventDetails(item);
    setModalVisibleEventDetails(true);
  };

  const handleEventPressUserInsert = (item: Evento) => {
    setSelectedEventUserInsert(item);
    setModalVisibleUserInsert(true);
  };

  const handleEventPressEventPartecipants = (item: Evento) => {
    setSelectedEventPartecipantsList(item);
    setModalVisiblePartecipantsList(true);
  };

  const renderItem = ({ item }: { item: Evento }) => (
    <ZoomableView onPress={() => {handleEventPressEventDetails(item); fetchData();}}>
      <View style={styles.eventContainer}>
        <IconButton buttonStyle={styles.eventAddpersonIcon} iconName='person-add-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => handleEventPressUserInsert(item)} />
        <View>
          <Image style={styles.eventIconImg} source={require('./imgs/Nyx_icon.jpg')} />
        </View>
        <View style={styles.eventInfosContainer}>
          <Text style={styles.eventTitle}>{item.titolo}</Text>
          <Text style={styles.eventDate}>Data: {item.data_evento}</Text>
          <Text style={styles.eventOrganizer}>Organizzatore: {item.organizzatori}</Text>
          <IconButton buttonStyle={styles.eventPartecipantsIcon} iconName='people-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => {handleEventPressEventPartecipants(item); fetchData();}} />
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
    fetchData();
  };

  const chiudiPopupEventPartecipants = () => {
    setModalVisiblePartecipantsList(false);
    setSelectedEventPartecipantsList(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SelectList
          setSelected={(val: React.SetStateAction<string>) => setSelected(val)}
          boxStyles={{ backgroundColor: '#050d25', 
            height: 45, 
            width: 175,
            borderRadius: 20,
            borderColor: '#D9D9D9',
          }}
          placeholder='Seleziona un filtro'
          inputStyles={{color: '#D9D9D9'}}
          arrowicon={<FontAwesome name="chevron-down" size={15} color={'#D9D9D9'} />} 
          searchicon={<FontAwesome name="search" size={15} color={'#D9D9D9'} />} 
          closeicon={<FontAwesome name="close" size={15} color={'#D9D9D9'} />}
          searchPlaceholder=''
          dropdownStyles={{position: 'absolute',
            top: 40, 
            width: 175,
            backgroundColor: '#050d25',
            borderColor: '#D9D9D9',
            borderRadius: 10,
            elevation: 4,
            zIndex: 1,}}
          dropdownTextStyles={{color: '#D9D9D9'}}
          data={data}
          save="value"
          onSelect={() => handleFilter(selected)}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Cerca per titolo..."
          placeholderTextColor={'#D9D9D9'}
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
      </View>
      <FlatList
        data={filteredEvents}
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
          chiudiPopup={chiudiPopupUserInsert}
          eventoId={selectedEventUserInsert.id}
        />
      )}
      {selectedEventPartecipantsList && (
        <EventPartecipantsPopup
          modalVisible={modalVisiblePartecipantsList}
          chiudiPopup={chiudiPopupEventPartecipants}
          eventId={selectedEventPartecipantsList.id}
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
    //padding: 20,
    alignContent: 'space-evenly',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 60,
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
    alignSelf: 'flex-end',
    color: '#D9D9D9', 
    fontWeight: 'bold',
    right: 3,
    top: 1
  },
  eventAddpersonIcon: {
    position: 'absolute',
    bottom: 80,
    right: 5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    height: 45,
    width: 175,
    marginLeft: 10,
    borderColor: '#D9D9D9', 
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    paddingLeft: 8,
    color: '#D9D9D9',
    backgroundColor: '#050d25', 
  },
  eventPartecipantsIcon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: 60
  }
});


export default EventList;
