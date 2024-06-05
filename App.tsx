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
      try {
        const db = await dbPromise;

        await db.executeSql(
          `CREATE TABLE IF NOT EXISTS utente (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            data_nascita DATE NOT NULL
          );`
        );
        await db.executeSql(
          `CREATE TABLE IF NOT EXISTS evento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titolo TEXT NOT NULL,
            descrizione TEXT NOT NULL,
            data_evento DATE NOT NULL,
            organizzatore TEXT NOT NULL,
            capienza INTEGER NOT NULL,
            immagine_path TEXT,
            FOREIGN KEY(organizzatore) REFERENCES utente(email) ON DELETE CASCADE
          );`
        );
        await db.executeSql(
          `CREATE TABLE IF NOT EXISTS partecipazione (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            data_nascita DATE NOT NULL,
            evento_id INTEGER NOT NULL,
            FOREIGN KEY(evento_id) REFERENCES evento(id) ON DELETE CASCADE
          );`
        );
      } catch (error) {
        console.error('Errore nella creazione delle tabelle:', error);
      }
    }
    prepareDB();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <MainContainer />
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
