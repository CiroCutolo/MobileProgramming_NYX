import { useEffect, useState } from 'react';
import MainContainer from './navigation/MainContainer'
import { Button, SafeAreaView, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import EventList from './Components/EventList';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

const App = () => {


  useEffect(() => {
    async function prepareDB() {
      const db = await dbPromise;
      await db.executeSql(
        'CREATE TABLE IF NOT EXISTS evento (id INTEGER PRIMARY KEY AUTOINCREMENT, titolo TEXT NOT NULL, descrizione TEXT NOT NULL, data_evento DATE NOT NULL, organizzatore TEXT NOT NULL, partecipanti INTEGER NOT NULL);'
      );
    }
    prepareDB();
  }, []);

    return(
        <SafeAreaView style={styles.container}>
              <MainContainer>
              </MainContainer>
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