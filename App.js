import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WebView } from 'react-native-webview';
import * as Animatable from 'react-native-animatable';

WebBrowser.maybeCompleteAuthSession();

const Tab = createBottomTabNavigator();

const books = [
  { title: 'SANOL: Origins', url: 'https://via.placeholder.com/150' },
  { title: 'SANOL: Echoes', url: 'https://via.placeholder.com/150' },
];

const useCoins = () => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('coins').then((val) => {
      if (val) setCoins(parseInt(val));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('coins', coins.toString());
  }, [coins]);

  const addCoins = (n) => setCoins((prev) => prev + n);

  return { coins, addCoins };
};

const calcDiscount = (coins) => Math.min(Math.floor(coins / 500), 20);

function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Animatable.Text animation="fadeInDown" style={styles.heading}>
        Rian Jakhar
      </Animatable.Text>
      <Animatable.Text animation="fadeInUp" delay={300} style={styles.description}>
        I'm Rian Jakhar, a 14-year-old creator, system thinker, and future chairman from India.{"\n\n"}
        While others chase trends, I build worlds — like SANOL, my creative universe of music, books, and digital expression.{"\n\n"}
        I don’t follow systems — I learn how they work, then make my own.{"\n\n"}
        This is just the base. The real game starts at 18. Until then, I build quietly.
      </Animatable.Text>
    </ScrollView>
  );
}

function ShopScreen() {
  return (
    <ScrollView style={styles.container}>
      {books.map((book, idx) => (
        <Animatable.View key={idx} animation="fadeInUp" delay={idx * 300} style={styles.card}>
          <Image source={{ uri: book.url }} style={styles.image} />
          <Text style={styles.bookTitle}>{book.title}</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`mailto:sanol@buy.com?subject=Buy: ${book.title}`)
            }
            style={styles.buyBtn}
          >
            <Text style={styles.buyText}>Buy</Text>
          </TouchableOpacity>
        </Animatable.View>
      ))}
    </ScrollView>
  );
}

function AccountScreen() {
  const { coins, addCoins } = useCoins();
  const [answer, setAnswer] = useState('');

  const checkAnswer = () => {
    if (answer.toLowerCase().trim() === 'sanol') {
      addCoins(500);
    }
    setAnswer('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.coin}>Coins: {coins}</Text>
      <Text style={styles.coin}>Discount: {calcDiscount(coins)}%</Text>
      <Text style={styles.qLabel}>What's Rian's universe called?</Text>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
        placeholder="Type your answer..."
        placeholderTextColor="#999"
      />
      <TouchableOpacity onPress={checkAnswer} style={styles.buyBtn}>
        <Text style={styles.buyText}>Submit Answer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SiteScreen() {
  return (
    <WebView
      source={{ uri: 'https://sanol-book-series-lb3a.b12sites.com' }}
      style={{ flex: 1 }}
    />
  );
}

function LoginScreen({ onLogin }) {
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: 'YOUR_TEST_CLIENT_ID.apps.googleusercontent.com', // Replace this when ready
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ['openid', 'profile', 'email'],
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: {
          Authorization: `Bearer ${response.authentication.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          onLogin(); // Just continue to app; no user info stored yet
        });
    }
  }, [response]);

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Button title="Login with Google" disabled={!request} onPress={() => promptAsync()} />
    </View>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#111', borderTopColor: '#333' },
          tabBarActiveTintColor: '#a020f0',
          tabBarInactiveTintColor: '#777',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
        <Tab.Screen name="Site" component={SiteScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a020f0',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: { fontSize: 16, color: '#ccc', lineHeight: 24 },
  card: { backgroundColor: '#222', marginBottom: 20, borderRadius: 12, padding: 16 },
  image: { width: '100%', height: 150, borderRadius: 10 },
  bookTitle: { color: '#fff', fontSize: 18, marginVertical: 8 },
  buyBtn: {
    backgroundColor: '#a020f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buyText: { color: '#fff', fontWeight: 'bold' },
  coin: { color: '#fff', fontSize: 16, marginVertical: 6 },
  qLabel: { color: '#ccc', marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: '#222', color: '#fff', padding: 10, borderRadius: 8 },
});