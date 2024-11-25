import { View } from 'react-native';
import React, { useState } from 'react';
import { Button, TextInput, Subheading } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/core';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const auth = getAuth(); 

  const handleSignIn = async () => {
    setError(''); 
    setIsLoading(true); 
    try {
      await signInWithEmailAndPassword(auth, email, password); 
      setIsLoading(false); 
      navigation.popToTop(); 
    } catch (e) {
      setIsLoading(false); 
      setError(e.message); 
    }
  };

  return (
    <View style={{ margin: 16 }}>
      {/* Display error message if any */}
      {!!error && (
        <Subheading style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Subheading>
      )}
      
      {/* Email input */}
      <TextInput
        label="Email"
        style={{ marginTop: 12 }}
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Password input */}
      <TextInput
        label="Password"
        style={{ marginTop: 12 }}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Buttons for Sign Up and Sign In */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <Button compact onPress={() => navigation.navigate('SignUp')} mode="contained-tonal">
          SIGN UP
        </Button>
        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={isLoading} 
          disabled={isLoading} 
        >
          SIGN IN
        </Button>
      </View>
    </View>
  );
};

export default SignIn;
