import React, { useEffect,  useState } from 'react';
import { View, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { GiftedChat } from "react-native-gifted-chat";
import { getAuth } from 'firebase/auth';

const Chat = () => {
  const route = useRoute();
  const [messages, setMessages] = useState([]); 
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");


    
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUid(user?.uid);
      setName(user?.displayName);
    });
    
    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    const db = getFirestore();  
    const chatDocRef = doc(db, "chats", route.params.chatId);  
  
    const unsubscribe = onSnapshot(chatDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        if (Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt.toDate(), 
            user: msg.user,
          }));
          setMessages(formattedMessages);  
        } else {
          console.log("Messages field is missing or not an array");
        }
      } else {
        console.log("Chat not found");
      }
    });
  
    return () => unsubscribe();  
  }, [route.params.chatId]);

  
  const onSend = async (m = []) => {
    const db = getFirestore(); 
    const chatDocRef = doc(db, 'chats', route.params.chatId); 
  
    try {
      await updateDoc(chatDocRef, {
        messages: arrayUnion(...m), 
      });
    } catch (error) {
      console.error("Error sending message: ", error); 
    }
  };

  return (
    <View
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback  onPress={Keyboard.dismiss}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{
              _id: uid,
              name: name,
            }}
            alwaysShowSend 
            scrollToBottom 
          />
      </TouchableWithoutFeedback>
    </View>
  );z
}; 

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 40,
  },
});

export default Chat;