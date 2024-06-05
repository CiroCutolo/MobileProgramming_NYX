import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';

interface Statistiche {
  titolo_evento: string;
  partecipanti: number;
}

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

// conta le partecipazioni per ogni evento
export const leggiDatiEvento = async (): Promise<Statistiche[]> => {
  try {
    const db = await dbPromise;
    // esegue una query SQL per ottenere il numero di partecipanti per ogni evento
    const results = await db.executeSql(`
      SELECT E.titolo as titolo_evento, COUNT(*) as partecipazioni
      FROM evento E
      JOIN partecipazione P ON E.id = P.evento_id
      GROUP BY E.titolo
    `);

    if (results.length > 0) {
      const rows = results[0].rows;
      const datiStatistiche: Statistiche[] = [];
      // itera sui risultati della query e li converte in un array di oggetti Statistiche
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        datiStatistiche.push({
          titolo_evento: item.titolo_evento,
          partecipanti: item.partecipazioni
        });
      }
      return datiStatistiche;
    }
    return [];
  } catch (error) {
    console.error('Errore nel recuperare i dati sugli eventi:', error);
    return [];
  }
};

interface Organizzatori {
  organizzatore: string;
  num_eventi: number;
}

// conta gli eventi per ogni organizzatore
export const leggiDatiOrganizzatore = async (): Promise<Organizzatori[]> => {
  try {
    const db = await dbPromise;
    // esegue una query SQL per ottenere il numero di eventi per ogni organizzatore
    const results = await db.executeSql(`
      SELECT E.organizzatore, U.nome || ' ' || U.cognome as organizzatore, COUNT(*) as num_eventi
      FROM evento E JOIN utente U ON E.organizzatore = U.email
      GROUP BY E.organizzatore, U.nome, U.cognome
      ORDER BY num_eventi DESC
    `);

    if (results.length > 0) {
      const rows = results[0].rows;
      const organizzatori: Organizzatori[] = [];
      // itera sui risultati della query e li converte in un array di oggetti Organizzatori
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        organizzatori.push({
          organizzatore: item.organizzatore,
          num_eventi: item.num_eventi
        });
      }
      return organizzatori;
    }
    return [];
  } catch (error) {
    console.error('Errore nel recuperare i dati sugli organizzatori:', error);
    return [];
  }
};

// creazione del componente Statistiche
const Statistiche: React.FC = () => {
  const [statistiche, setStatistiche] = useState<Statistiche[]>([]);
  const [organizzatori, setOrganizzatori] = useState<Organizzatori[]>([]);

  // aggiorna il contenuto della pagina (sull'onScroll)
  const update = async () => {
    try {
      const updateStatistics = await leggiDatiEvento();
      const updateOrganizzatori = await leggiDatiOrganizzatore();
      setStatistiche(updateStatistics);
      setOrganizzatori(updateOrganizzatori);
    } catch (err) {
      console.log(err);
    }
  };

  // richiama la funzione di aggiornamento all'avvio del componente
  useEffect(() => {
    update();
  }, []);

  useEffect(() => {
    // recupera tutti i dati per il grafico sui partecipanti
    const fetchData = async () => {
      try {
        const dati = await leggiDatiEvento();
        setStatistiche(dati);
      } catch (error) {
        console.error('Errore nel recuperare i dati:', error);
      }
    };
    // richiama la funzione di recupero dei dati
    fetchData();
  }, []);

  useEffect(() => {
    // recupera tutti i dati per il grafico sugli organizzatori
    const fetchData2 = async () => {
      try {
        const dati2 = await leggiDatiOrganizzatore();
        setOrganizzatori(dati2);
      } catch (error) {
        console.error('Errore nel recuperare i dati:', error);
      }
    };
    // richiama la funzione di recupero dei dati
    fetchData2();
  }, []);

  // filtra solo i risultati che hanno un valore, su cui saranno basati i grafici
  const validData = statistiche.filter(stat => stat.titolo_evento && stat.partecipanti !== undefined);
  const validData2 = organizzatori.filter(stat => stat.organizzatore && stat.num_eventi !== undefined);

  // definisce le proprietà sui dati del primo grafico
  const data = {
    labels: validData.map(stat => stat.titolo_evento),
    datasets: [
      {
        label: "Numero di Partecipanti",
        data: validData.map(stat => stat.partecipanti),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(145, 126, 163, ${opacity})`,
      },
    ],
  };

  // definisce la configurazione degli elementi del primo grafico
  const chartConfig = {
    backgroundGradientFrom: '#edf6d6',
    backgroundGradientTo: '#edf6d6',
    color: (opacity = 1) => `rgba(160, 110, 183, ${opacity})`,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: '#917ea3',
      fill: '#917ea3'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
    propsForLabels: {
      fontSize: 12,
    }
  };

  // genera tutti colori casuali sulla scala del viola per il grafico a torta, per rimanere sul tema dei colori dell'app
  const generaColoriSulViola = () => {
    const red = Math.floor(Math.random() * 100) + 155; // assicura che il rosso sia compreso tra 155 e 255
    const green = Math.floor(Math.random() * 50); // assicura che il verde sia compreso tra 0 e 50
    const blue = Math.floor(Math.random() * 150) + 105; // assicura che il blu sia compreso tra 105 e 255
    return `rgb(${red},${green},${blue})`;
  };

  // definisce le proprietà sui dati del primo grafico
  const data2 = organizzatori.map((organizzatore) => ({
    name: organizzatore.organizzatore,
    num_eventi: organizzatore.num_eventi,
    color: generaColoriSulViola(),
  }));

  // definisce la configurazione degli elementi del primo grafico
  const chartConfig2 = {
    backgroundGradientFrom: '#edf6d6',
    backgroundGradientTo: '#edf6d6',
    color: (opacity = 1) => `rgba(150, 130, 183, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  //cotruisce la schermata con tutti i componenti, tra cui i due grafici sulle statistiche, applicando poi i vari stili
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grafico1}>
          <Text style={styles.title}>GLI EVENTI PIÙ AMATI</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.linechart}>
              {validData.length > 0 ? (
                <LineChart
                  data={data}
                  width={Math.max(Dimensions.get('window').width, validData.length * 120)}
                  height={400}
                  chartConfig={chartConfig}
                  bezier
                />
              ) : (
                <Text>Nessun dato disponibile</Text>
              )}
              <Text style={styles.etichetta1}>EVENTI</Text>
              <Text style={styles.etichetta2}>PARTECIPAZIONI</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.grafico2}>
          <Text style={styles.title}>GLI ORGANIZZATORI PIÙ POPOLARI</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.piechart}>
              {validData2.length > 0 ? (
                <PieChart
                  data={data2}
                  width={Dimensions.get('window').width}
                  height={validData2.length * 30}
                  chartConfig={chartConfig2}
                  accessor="num_eventi"
                  backgroundColor="transparent"
                />
              ) : (
                <Text>Nessun dato disponibile</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050d25',
    padding: 20,
  },
  grafico1: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    marginVertical: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#edf6d6'
  },
  linechart: {
    marginTop: 12,
    backgroundColor: '#edf6d6',
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 50,
    marginBottom: 155
  },
  grafico2: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: -125,
  },
  piechart: {
    marginTop: 20,
    backgroundColor: '#edf6d6',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 10,
  },
  etichetta1: {
    position: 'absolute',
    fontWeight: 'bold',
    top: 410,
    left: 170
  },
  etichetta2: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
    fontWeight: 'bold',
    left: -30,
    top: 210,
  }
});

export default Statistiche;
