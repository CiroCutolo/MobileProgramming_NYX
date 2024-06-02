import React, { useEffect, useState } from 'react';
import { StyleSheet, Modal, Text, View, SafeAreaView, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import SQLite from 'react-native-sqlite-storage';
import SuccessPopup from './SuccessScreen';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

interface PartecipantAdderPopupProps {
  modalVisible: boolean;
  chiudiPopup: () => void;
  eventoId: number; 
}

const PartecipantAdderPopup: React.FC<PartecipantAdderPopupProps> = ({ modalVisible, chiudiPopup, eventoId }) => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [date, setDate] = useState(new Date());
  const [result, setResult] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [affirmativeOrnegative, setAffirmativeOrNegative] = useState(false);

  useEffect(() => {
    async function prepareDB() {
      const db = await dbPromise;
      await db.executeSql(
        'CREATE TABLE IF NOT EXISTS partecipazione (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, cognome TEXT NOT NULL, data_partecipazione DATE NOT NULL, evento_id INTEGER NOT NULL, FOREIGN KEY(evento_id) REFERENCES evento(id));'
      );
    }
    prepareDB();
  }, []);

  const aggiungiPartecipazione = async () => {
    try {
      if (!nome || !cognome || !date || date < (new Date()) || !/^[A-Za-z\s\-]+$/.test(nome) || !/^[A-Za-z\s\-]+$/.test(cognome)) {
        setAffirmativeOrNegative(false);
        setShowPopup(true);
        return;
      }
  
      const db = await dbPromise;
      await db.executeSql('INSERT INTO partecipazione (nome, cognome, data_partecipazione, evento_id) VALUES (?, ?, ?, ?)', [nome, cognome, date.toISOString(), eventoId]);
      setAffirmativeOrNegative(true);
      setShowPopup(true);
      
    } catch (error) {
      setAffirmativeOrNegative(false);
      setShowPopup(true);
    }
  };

  return (
    <SafeAreaView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={chiudiPopup}
      >
        <TouchableWithoutFeedback onPress={chiudiPopup}>
          <View style={styles.view1}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.popup}>
                <Text style={styles.PopupTitle}>Inserisci i dati del partecipante.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome"
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cognome"
                  value={cognome}
                  onChangeText={setCognome}
                />
                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  mode="date"
                  locale="it"
                />
                <TouchableOpacity style={styles.button2} onPress={() => {
                                                                  aggiungiPartecipazione();
                                                                  chiudiPopup(); 
                                                                  setNome('');
                                                                  setCognome('');
                                                                        }}>
                  <Text style={styles.buttonText}>Conferma</Text>
                </TouchableOpacity>
                {result && <Text style={styles.resultText}>{result}</Text>}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
        <SuccessPopup visible={showPopup} chiudiPopup={() => setShowPopup(false)} success={affirmativeOrnegative} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#F5EBCF',
    padding: 20,
    borderRadius: 20,
    width: 350,
    alignContent: 'center',
    maxHeight: 500,
  },
  input: {
    height: 40,
    borderColor: '#050D25',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#D9D9D9',
    fontSize: 15,
    color: '#050D25',
  },
  PopupTitle: {
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 15,
    color: '#050d25'
  },
  button2: {
    backgroundColor: '#050D25',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: 100,
  },
  buttonText: {
    color: '#D9D9D9',
    fontSize: 16,
  },
  resultText: {
    marginTop: 10,
    color: 'white',
    textAlign: 'center',
  }
});

export default PartecipantAdderPopup;
