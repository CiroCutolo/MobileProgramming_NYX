import React, { useState, useEffect } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });


// crea la struttura per la registrazione
interface RegistrazioneUtente {
    nome: string;
    cognome: string;
    data_nascita: string;
    email: string;
    password: string;
    confermaPassword: string;
}

// definisce la struttura delle props che possono essere passate al componente FormRegistrazione
interface FormRegistrazioneProps {
    aggiungiUtente: (utente: RegistrazioneUtente) => void;
}

const Registrazione = () => {

    // intergisce con il db per eseguire l'inserimento dell'utente, sulla base dei parametri indicati dall'utente nel form
    const aggiungiUtente = async (form) => {
        try {
            const db = await dbPromise;

            // verifica se l'email indicata esiste già nel database
            const [result] = await db.executeSql(
                'SELECT COUNT(*) as count FROM utente WHERE email = ?',
                [form.email]
            );

            // estrae il conteggio dalla risposta
            const count = result.rows.item(0).count;

            // se l'email esiste già, mostra un alert di errore e non consente l'inserimento
            if (count > 0) {
                Alert.alert('Errore', 'L\'email inserita è già esistente.');
                return;
            }

            // altrimenti, continua con l'inserimento dell'utente, tramite una transazione per rendere persistenti le modifiche nel db
            await db.transaction(async (tx) => {
                await tx.executeSql(
                    'INSERT INTO utente (email, password, nome, cognome, data_nascita) VALUES (?, ?, ?, ?, ?)',
                    [form.email, form.password, form.nome, form.cognome, form.data_nascita]
                );
            });

        } catch (error) {
            console.error('Errore nell\'aggiungere l\'utente', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <FormRegistrazione aggiungiUtente={aggiungiUtente} />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

// definisce il componente FormRegistrazione sulla base delle props definite precedentemente
const FormRegistrazione: React.FC<FormRegistrazioneProps> = ({ aggiungiUtente }) => {

    const [form, setForm] = useState<RegistrazioneUtente>({
        nome: '',
        cognome: '',
        data_nascita: '',
        email: '',
        password: '',
        confermaPassword: '',
    });

    // definisce degli state utili per il datePicker e la data
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [date, setDate] = useState(new Date());
    const navigation = useNavigation();

    // aggiorna lo stato del form in base agli input inseriti nei campi del form
    const handleInputChange = (key: keyof RegistrazioneUtente, value: string) => {
        setForm(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    // per la data viene effettuato un toString per poterla inserire nel db, con lo split che taglia la parte dell'orario
    const handleDate = (date: Date) => {
        setForm(prevState => ({
            ...prevState,
            data_nascita: date.toISOString().split('T')[0],
        }));
        setDatePickerVisibility(false);
    };

    // controlla se il formato dell'email è valido
    const isEmailValid = (email: string): boolean => {
        return email.includes('@') && email.includes('.');
    };

    // effettua tutti i controlli sui campi inseriti, quando viene cliccato il bottone 'Registrati', mostrando degli alert in caso di errori
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

         // chiama la funzione per salvare l'email inserita
        _storeData(form.email);
        navigation.navigate('Account');
    };

    // salva l'email dell'utente registrato nel local storage, per permettere di simulare il meccanismo della 'sessione'
    const _storeData = async (email) => {
        try {
            await AsyncStorage.setItem('@email', email);
        } catch (error) {
            console.log("Errore nell'inserimento in AsyncStorage");
        }
    };

    //cotruisce la schermata con tutti i componenti del form, ai quali applica i successivi stili
    return (
        <SafeAreaView style={styles2.container}>
            <Text style={styles2.text}>
                {'REGISTRATI PER AGGIUNGERE \n                I TUOI EVENTI\n'}
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
                    onPress={() => setDatePickerVisibility(true)}
                />

                {isDatePickerVisible && (
                    <DatePicker
                        modal
                        locale='it'
                        title="Seleziona la data di nascita"
                        buttonColor='purple'
                        open={isDatePickerVisible}
                        date={date}
                        onConfirm={(date) => {
                            handleDate(date);
                            setDate(date);
                        }}
                        onCancel={() => setDatePickerVisibility(false)}
                        mode="date"
                        textColor="#4a3358"
                        fadeToColor="#4a3358"
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
        backgroundColor: '#050d25',
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
        backgroundColor: '#050d25',
    },
    form: {
        width: '100%',
    },
    input: {
        height: 40,
        borderColor: '#917ea3',
        borderWidth: 3,
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#edf6d6',
        fontSize: 15,
        color: 'black',
    },
    button: {
        backgroundColor: '#917ea3',
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
        color: '#917ea3',
    },

});

export default Registrazione;
