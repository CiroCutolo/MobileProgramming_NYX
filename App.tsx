import { useEffect, useState } from 'react';
import MainContainer from './navigation/MainContainer';
import { Button, SafeAreaView, StyleSheet, Text } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

const App = () => {
  const [result, setResult] = useState('');

  useEffect(() => {
    async function prepareDB() {
      const db = await dbPromise;
      await db.executeSql(
        'CREATE TABLE IF NOT EXISTS evento (id INTEGER PRIMARY KEY AUTOINCREMENT, titolo TEXT NOT NULL, descrizione TEXT NOT NULL, data_evento DATE NOT NULL, organizzatore TEXT NOT NULL, partecipanti INTEGER NOT NULL);'
      );
    }
    prepareDB();
  }, []);

  const aggiungiEvento = async () => {
    try {
      const db = await dbPromise;
      await db.executeSql(
        'INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, capienza) VALUES (?, ?, ?, ?, ?)',
        ['Festa di Aury', 'siete gay', '2024-06-06', 'Aurora', 2]
      );
      setResult('Evento aggiunto con successo');
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'evento:', error);
      setResult('Errore nell\'aggiungere l\'evento.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainContainer />
      <Button title="Aggiungi" onPress={aggiungiEvento} />
      {result ? <Text style={styles.resultText}>{result}</Text> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050d25',
    flex: 1,
  },
  resultText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default App;
