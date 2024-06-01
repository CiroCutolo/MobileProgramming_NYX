import React, { useState, useEffect } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DatePicker from 'react-native-date-picker';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

const App = () => {
    const [result, setResult] = useState('');
    useEffect(() => {
            async function prepareDB() {
              const db = await dbPromise;
              await db.executeSql(
                'CREATE TABLE IF NOT EXISTS utente (email TEXT PRIMARY KEY, password TEXT NOT NULL, nome TEXT NOT NULL, cognome TEXT NOT NULL, data_nascita DATE NOT NULL);'
              );
            }
            prepareDB();
    }, []);
    const aggiungiUtente = async (form: RegistrazioneUtente) => {
        try {
            const db = await dbPromise;

            // verifica se l'email esiste già nel database
            const [result] = await db.executeSql(
                'SELECT COUNT(*) as count FROM utente WHERE email = ?',
                [form.email]
            );

            // estrae il conteggio dalla risposta
            const count = result.rows.item(0).count;

            // se l'email esiste già, mostra un popup di errore
            if (count > 0) {
                Alert.alert('Errore', 'L\'email inserita è già esistente.');
                return;
            }

            // altrimenti, continua con l'inserimento dell'utente, con una transazione per rendere persistenti le modifiche nel db
            await db.transaction(async (tx) => {
                await tx.executeSql(
                    'INSERT INTO utente (email, password, nome, cognome, data_nascita) VALUES (?, ?, ?, ?, ?)',
                    [form.email, form.password, form.nome, form.cognome, form.data_nascita]
                );
                //segnala che la transazione è stata completata con successo
                await tx.executeSql('COMMIT;');
            });

            setResult('Aggiunto ' + form.nome);
        } catch (error) {
            console.error('Errore nell\'aggiungere l\'utente', error);
            setResult('Errore nell\'aggiungere l\'utente.');
        }
    };



    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Text>{result}</Text>
          <FormRegistrazione aggiungiUtente={aggiungiUtente} />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
};

//crea la struttura per la registrazione
interface RegistrazioneUtente {
  nome: string;
  cognome: string;
  data_nascita: string;
  email: string;
  password: string;
  confermaPassword: string;
}

//inizializza la struttura
interface FormRegistrazioneProps {
  aggiungiUtente: (utente: RegistrazioneUtente) => void;
}

const FormRegistrazione: React.FC<FormRegistrazioneProps> = ({ aggiungiUtente }) => {
  const [form, setForm] = useState<RegistrazioneUtente>({
    nome: '',
    cognome: '',
    data_nascita: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState(new Date());

  //aggiorna la struttura in base all'input inserito nei campi
  const handleInputChange = (key: keyof RegistrazioneUtente, value: string) => {
    setForm(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleDate = (date: Date) => {
    setForm(prevState => ({
      ...prevState,
      data_nascita: date.toISOString().split('T')[0],
    }));
    setDatePickerVisibility(false);
  };

  const isEmailValid = (email: string): boolean => {
    return email.includes('@') && email.includes('.');
  };

  const submit = () => {
    if (
      !form.nome ||
      !form.cognome ||
      !form.data_nascita ||
      !form.email ||
      !form.password ||
      !form.confermaPassword
    ) {
      Alert.alert('Errore', 'Tutti i campi devono essere compilati.');
      return;
    }

    if (!isEmailValid(form.email)) {
          Alert.alert('Errore', 'Email non valida.');
          return;
        }

    if (form.password.length > 10 || form.password.length < 5) {
      Alert.alert('Errore', 'La password deve contenere da un minimo di 5 caratteri, ad un massimo di 10.');
      return;
    }

    if (form.password !== form.confermaPassword) {
      Alert.alert('Errore', 'Le password non coincidono.');
      return;
    }
    aggiungiUtente(form);

    setForm({ // resetta tutti i campi a valori vuoti
        nome: '',
        cognome: '',
        data_nascita: '',
        email: '',
        password: '',
        confermaPassword: '',
    });
  };

  return (
    <SafeAreaView style={styles2.container}>
      <Text style={styles2.text}>
        {'REGISTRATI PER PARTECIPARE \n           AI NOSTRI EVENTI\n'}
      </Text>
      <View style={styles2.form}>
        <TextInput
          style={styles2.input}
          placeholder="Nome"
          value={form.nome}
          onChangeText={(text) => handleInputChange('nome', text)}
        />
        <TextInput
          style={styles2.input}
          placeholder="Cognome"
          value={form.cognome}
          onChangeText={(text) => handleInputChange('cognome', text)}
        />
        <TextInput
          style={styles2.input}
          placeholder="Data di nascita"
          value={form.data_nascita}
          onFocus={() => setDatePickerVisibility(true)}
        />

        {isDatePickerVisible && (
          <DatePicker
            modal
            open={isDatePickerVisible}
            date={date}
            onConfirm={(date) => {
              handleDate(date);
              setDate(date);
            }}
            onCancel={() => setDatePickerVisibility(false)}
            mode="date"
            theme="dark"
            maximumDate={new Date()}
          />
        )}

        <TextInput
          style={styles2.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
        <TextInput
          style={styles2.input}
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleInputChange('password', text)}
        />
        <TextInput
          style={styles2.input}
          placeholder="Conferma Password"
          secureTextEntry
          value={form.confermaPassword}
          onChangeText={(text) => handleInputChange('confermaPassword', text)}
        />
        <TouchableOpacity style={styles2.button} onPress={submit}>
          <Text style={styles2.buttonText}>Registrati</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5ebcf',
  },
  resultText: {
    marginTop: 20,
  },
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5ebcf',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#050d25',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#d9d9d9',
    fontSize: 15,
    color: 'black',
  },
  button: {
    backgroundColor: '#050d25',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#050d25',
  },

});

export default App;
