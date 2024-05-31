import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import EventList from './Components/EventList'; // Assicurati che il percorso sia corretto

// Abilita Promise per SQLite
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
    await db.executeSql('INSERT INTO evento (titolo, descrizione, data_evento, organizzatore, partecipanti ) VALUES (?, ?, ?, ?, ?)', ['FestaDrogante', 'In questa festa non ci si droga', '2024-06-28', 'Pippo Baudo', 30]);
    setResult('Aggiunto ');
  } catch (error) {
    console.error('Errore nell\'aggiungere l\'evento', error);
    setResult('Errore nell\'aggiungere l\'evento.');
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <EventList />
      <Button title="Aggiungi" onPress={aggiungiEvento} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050d25',
    flex: 1,
  },
});

export default App;