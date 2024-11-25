import React, { useState, useEffect } from "react";
import { View } from "react-native";
import {
  List,
  Avatar,
  Divider,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
} from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";

const ChatList = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const createChat = async () => {
    if (!email || !userEmail) return;

    try {
      setIsLoading(true);
      const db = getFirestore();
      const response = await addDoc(collection(db, "chats"), {
        users: [email, userEmail],
        createdAt: new Date(),
      });
      setIsLoading(false);
      setIsDialogVisible(false);
      setUserEmail("");
      navigation.navigate("Chat", { chatId: response.id });
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating chat:", error);
      alert("Error creating chat: " + error.message);
    }
  };

  useEffect(() => {
    if (!email) return;

    const db = getFirestore();
    const chatsQuery = query(collection(db, "chats"), where("users", "array-contains", email));
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      setChats(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [email]);

  return (
    <View style={{ flex: 1 }}>
      {chats.map((chat) => (
        <React.Fragment key={chat.id}>
          <List.Item
            title={chat.users.find((user) => user !== email) || "User Name"}
            description="Hi, I will be waiting for you"
            left={() => (
              <Avatar.Text
                label={chat.users
                  .find((user) => user !== email)
                  ?.split(" ")
                  .reduce((prev, current) => prev + current[0], "") || "UN"}
                size={56}
              />
            )}
            onPress={() => navigation.navigate("Chat", { chatId: chat.id })}
          />
          <Divider inset />
        </React.Fragment>
      ))}

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>New Chat</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter user email"
              value={userEmail}
              onChangeText={(text) => setUserEmail(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={createChat} loading={isLoading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: "absolute", bottom: 16, right: 16 }}
        onPress={() => setIsDialogVisible(true)}
      />
    </View>
  );
};

export default ChatList;
