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
import RNFS from 'react-native-fs';

//Interfaccia che definisce le specifiche di un evento.
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

/*******************************************************/ 
/*Parte di codice dedicata alle comunicazioni con il DB*/
/*******************************************************/
SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

//Lettura di tutte le tuple presenti nella tabella 'Evento'
const leggiEvento = async (): Promise<Evento[]> => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql('SELECT * FROM evento');

    //Si controlla se la query ha prodotto risultato
    if (results.length > 0) {
      const rows = results[0].rows;
      const events: Evento[] = [];
      for (let i = 0; i < rows.length; i++) {
        //Si inserisce l'evento di indice 'i' nella collezione di eventi.
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

//Lettura, tramite 'count()', del numero di partecipanti
const leggiNumeroPartecipanti = async () => {
  try {
    const db = await dbPromise;
    const results = await db.executeSql(`
    SELECT P.evento_id as evento, COUNT(*) as partecipazioni
    FROM evento E
    JOIN partecipazione P ON E.id = P.evento_id
    GROUP BY P.evento_id
    `);

    //Si controlla se la query ha prodotto risultato
    if (results.length > 0) {
      const rows = results[0].rows;
      const partecipazioni: { [key: number]: number } = {};
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        //si inserisce per ogni evento, utilizzato come indice '[item.evento]', il numero di partecipanti.
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

//Lettura del nome e del cognome legati alla mail dell'organizzatore unendoli in una sola variabile
const leggiOrganizzatore = async () => {
  try {
    const db = await dbPromise;

    //l'operatore || ' ' || serve ad unire gli attributi 'U.nome' ed 'U.cognome'
    const results = await db.executeSql(`
      SELECT E.id as evento_id, U.nome || ' ' || U.cognome as organizzatore
      FROM evento E
      JOIN utente U ON E.organizzatore = U.email
    `);

    //Si controlla se la query ha prodotto risultato
    if (results.length > 0) {
      const rows = results[0].rows;
      const organizzatori: { [key: number]: string } = {};
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        //Viene inserito il valore nome+cognome nell'array di organizzatori, indicizzato per evento.
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

/********************************************************/ 
/*******Parte di codice dedicata alla ZoomableView*******/
/********************************************************/
//Vengono definiti i props utili al componente Zoomable view
interface ZoomableViewProps {
  children: React.ReactNode; //Si ragiona su dei nodi che nell'albero sono sempre figli.
  onPress: () => void; //Si aggiunge la possibilità di utilizzare una funzione con trigger 'onPress'
  viewStyle?: StyleProp<ViewStyle> //Si permette la definizione di uno stile per il componente.
}

//Viene definito un function component che al click permetta lo zoom dei componenti figli.
const ZoomableView: React.FC<ZoomableViewProps> = ({ children, onPress, viewStyle }) => {
  const [scale] = useState(new Animated.Value(1));

  //Viene gestito il click 'in'.
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  //Viene gestita la "fine" del click.
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  //Viene costruita la struttura del componente.
  return (
    <TouchableWithoutFeedback style={viewStyle} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[{ transform: [{ scale }] }, viewStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

/*********************************************************/ 
/*********Parte di codice dedicata alla EventList*********/
/*********************************************************/
//Viene definto il componente principale 'EventList' che mostra la lista di eventi letta dal DB.
const EventList: React.FC = () => {

  //Definizione di tutti i local states.
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
  const [imageExists, setImageExists] = useState<{ [key: number]: boolean }>({});

  //Definizioni dei valori dei filtri.
  const data = [
    { key: '1', value: 'Evento passato' },
    { key: '2', value: 'Evento futuro' },
    { key: '3', value: 'Tutti gli eventi'}
  ];

  //Funzione utile all'ottenimento della data corrente come iso-string contenente solo 'ANNO-MESE-GIORNO'
  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  //Definizione della logica riguardante il filtraggio degli eventi.
  const handleFilter = (item: string) => {
    const currentDate = getCurrentDate();
    let filtered = events;

    //Filtraggio degli eventi in base alle etichette del dropdown select.
    if (item === 'Evento passato') {
      filtered = filtered.filter(event => event.data_evento < currentDate);
    } else if (item === 'Evento futuro') {
      filtered = filtered.filter(event => event.data_evento >= currentDate);
    }else if (item === 'Tutti gli eventi'){
      filtered = events;
    }else {
      filtered = events;
    }

    //Filtraggio basato sul titolo, a ricerca libera.
    if (searchText) {
      filtered = filtered.filter(event => event.titolo.toLowerCase().includes(searchText.toLowerCase()));
    }

    setFilteredEvents(filtered);
  }

  //Funzione utile all'esecuzione complessiva delle funzioni utili ad ottenere i vari dati associati agli eventi. 
  const fetchData = async () => {
    try {
      const eventData = await leggiEvento(); //Lista Eventi.
      const partecipazioniEventi = await leggiNumeroPartecipanti(); //Numeri partecipanti degli eventi.
      const organizzatoriEventi = await leggiOrganizzatore(); //Nomi e cognomi degli organizzatori.

      //Viene creato un nuovo array comprendente tutte le proprietà degli eventi e modificante le proprietà partecipanti ed organizzatori.
      const eventsDetails = eventData.map(event => ({
        ...event,
        partecipanti: partecipazioniEventi[event.id] || 0, //Se not null si prende il valore, altrimenti 0.
        organizzatori: organizzatoriEventi[event.id] || 'Non disponibile' //Se not null si prende il valore, altrimenti 'Non disponibile'.
      }));

      setEvents(eventsDetails);
      setFilteredEvents(eventsDetails);
    } catch (err) {
      console.log(err);
    }
  };

  //Definizione del hook richiamante il recupero dei dati degli eventi.
  useEffect(() => {
    fetchData();
  }, []);

  //Definizione del hook richiamante il filtraggio degli eventi.
  useEffect(() => {
    handleFilter(selected);
  }, [selected, searchText, events]);

  //Definizione del hook controllante l'esistenza  dell'immagine.
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


  //Apertura del popup contenente i dettagli dell'evento.
  const handleEventPressEventDetails = (item: Evento) => {
    setSelectedEventEventDetails(item); //Viene passato l'evento da cui leggere i dettagli.
    setModalVisibleEventDetails(true); //Viene mostrato il popup.
  };

  //Apertura del popup utile all'inserimento dei partecipanti.
  const handleEventPressUserInsert = (item: Evento) => {
    setSelectedEventUserInsert(item); //Viene passato l'evento a cui associare il partecipante.
    setModalVisibleUserInsert(true); //Viene mostrato il popup.
  };

  //Apertura del popup contenente la lista dei partecipanti.
  const handleEventPressEventPartecipants = (item: Evento) => {
    setSelectedEventPartecipantsList(item); //Viene passato l'evento per il quale ottenere la lista di partecipanti.
    setModalVisiblePartecipantsList(true); //Viene mostrato il popup.
  };

  //Chiusura del popup (Uguale per i metodi di chiusura sottostanti).
  const chiudiPopup = () => {
    setModalVisibleEventDetails(false); //Viene reso invisibile il popup.
    setSelectedEventEventDetails(null); //Viene impostato a 'null' l'item passato come parametro.
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

  //Viene renderizzato graficamente il componente mostrante la lista degli eventi.
  const renderItem = ({ item }: { item: Evento }) => {
    const imageSource = imageExists[item.id] ? { uri: `file://${item.immagine_path}` } : require('./imgs/Nyx_icon.jpg');
    return (
    <ZoomableView onPress={() => handleEventPressEventDetails(item)}>
      <View style={styles.eventContainer}>
        <IconButton buttonStyle={styles.eventAddpersonIcon} iconName='person-add-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => handleEventPressUserInsert(item)} />
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
          <Text style={styles.eventOrganizer}>Organizzatore: {item.organizzatori}</Text>
          <IconButton buttonStyle={styles.eventPartecipantsIcon} iconName='people-outline' iconSize={25} iconColor={'#D9D9D9'} onPress={() => {handleEventPressEventPartecipants(item); fetchData();}} />
          <Text style={styles.eventParticipants}>{item.partecipanti}</Text>
        </View>
      </View>
    </ZoomableView>
    );
  }

  //Viene costruita la pagina mostrante i filtri, la lista di eventi ed i vari popup invisibili.
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
        onScroll={() => fetchData()}
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
