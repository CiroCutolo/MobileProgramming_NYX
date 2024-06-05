import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import IconButton from './IconButton';
import PartecipantAdderPopup from './PartecipantAdderPopup';
import Ionicons from 'react-native-vector-icons/Ionicons';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

//Definizione interfaccia partecipazione associante nome e cognome del partecipante all'id dell'evento.
interface Partecipazione {
    id: number; //id evento.
    nome: string; //nome partecipante.
    cognome: string; //cognome partecipante.
}

//Definizione props del componente EventPartecipantPopup.
interface EventPartecipantsPopupProps {
    modalVisible: boolean; //Check per la visibilità.
    chiudiPopup: () => void; //Metodo intrinseco di chiusura.
    eventId: number; //Id dell'evento di cui mostrare i partecipanti.
}

//Lettura dei partecipanti ad un evento.
const leggiPartecipazione = async (eventId: number): Promise<Partecipazione[]> => {
    try {
        const db = await dbPromise;
        const results = await db.executeSql('SELECT id, nome, cognome FROM partecipazione WHERE evento_id = ?', [eventId]);

        //Si controlla che la query abbia prodotto risultato.
        if (results.length > 0) {
            const rows = results[0].rows;
            const partecipants: Partecipazione[] = [];
            for (let i = 0; i < rows.length; i++) {
                //Viene popolato l'array di partecipanti per ogni evento.
                partecipants.push(rows.item(i));
            }
            return partecipants;
        }
        return [];
    } catch (error) {
        console.error('Errore nella lettura degli eventi', error);
        return [];
    }
};

//Viene definito il function component.
const EventPartecipantsPopup: React.FC<EventPartecipantsPopupProps> = ({ modalVisible, chiudiPopup, eventId }) => {
    const [partecipants, setPartecipants] = useState<Partecipazione[]>([]);

    //Viene definito un hook per la lettura dei partecipanti.
    useEffect(() => {
        leggiPartecipazione(eventId)
            .then((data) => {
                if (data) {
                    setPartecipants(data);
                }
            })
            .catch((err) => console.log(err));
    }, [eventId]);

    //Viene costruito il componente.
    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={chiudiPopup}
        >
            <TouchableWithoutFeedback onPress={chiudiPopup}>
                <View style={styles.modalContainer}>
                    <View style={styles.partecipantContainer}>
                        <FlatList
                            data={partecipants}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.partecipantItem}>
                                    <Ionicons name={'person-outline'} size={24} style={styles.partecipantIcon} />
                                    <View>
                                        <Text style={styles.partecipantName}>{item.nome}</Text>
                                        <Text style={styles.partecipantSurname}>{item.cognome}</Text>
                                    </View>
                                </View>
                            )}
                        />
                        <IconButton
                            buttonStyle={styles.closeButton}
                            iconName='close'
                            iconSize={25}
                            iconColor={'#D9D9D9'}
                            onPress={chiudiPopup}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    partecipantContainer: {
        backgroundColor: '#f5ebcf',
        padding: 20,
        borderRadius: 20,
        width: 350,
        maxHeight: 500,
    },
    partecipantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    partecipantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#050d25'
    },
    partecipantSurname: {
        fontSize: 14,
        color: '#050d25',
    },
    partecipantIcon: {
        marginRight: 10,
        color: '#050d25'
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default EventPartecipantsPopup;
