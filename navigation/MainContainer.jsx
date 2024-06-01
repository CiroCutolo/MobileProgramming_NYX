import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, TouchableOpacity } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AccountScreen from './screens/AccountScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticScreen from './screens/StatisticScreen';
import Popup from './screens/Popup';
import Registrazione from './screens/Registrazione';

const homeName = 'Home';
const accountName = 'Account';
const calendarName = 'Calendar';
const statisticName = 'Statistic';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
    const [modalVisible, setModalVisible] = useState(false);

    const apriPopup = () => {
        setModalVisible(true);
    };

    const chiudiPopup = () => {
        setModalVisible(false);
    };

    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName={homeName}
                screenOptions={({ route, navigation }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let rn = route.name;

                        if (rn === homeName) {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (rn === accountName) {
                            iconName = focused ? 'person' : 'person-outline';
                        } else if (rn === calendarName) {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (rn === statisticName) {
                            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                        }

                        return <Ionicons name={iconName} size={28} color={'#f5ebcf'} />;
                    },
                    headerStyle: {
                        backgroundColor: '#180529',
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate(homeName)}>
                            <Image
                                source={require('./logo.png')}
                                style={{ width: 50, height: 50, marginRight: 15 }} />
                        </TouchableOpacity>
                    ),
                    tabBarActiveTintColor: '#660066',
                    tabBarInactiveTintColor: '#f6edd5',
                    tabBarStyle: {
                        backgroundColor: '#180529',
                    },
                })}
            >
                <Tab.Screen name={homeName} component={HomeScreen} />
                <Tab.Screen name={statisticName} component={StatisticScreen} />
                <Tab.Screen name={calendarName} component={CalendarScreen} />
                <Tab.Screen
                    name={accountName}
                    component={AccountScreen}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            apriPopup();
                        },
                    }}
                />
                <Tab.Screen name="Registrazione" component={Registrazione} options={{ tabBarButton: () => null }} />
            </Tab.Navigator>
            <Popup modalVisible={modalVisible} chiudiPopup={chiudiPopup} />
        </NavigationContainer>

    );
}
