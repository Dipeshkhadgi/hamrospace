import User from "../models/userModel/user.js";
import Chat from "../models/chatModel/chat.js";
import { faker, simpleFaker } from "@faker-js/faker";
import Message from "../models/messageModel/message.js";

export const createUser = async (numUsers) => {
  try {
    const usersPromise = [];
    for (let i = 0; i < numUsers; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        email: `${faker.internet.userName()}@gmail.com`,
        mobile_No: faker.number.int({ min: 1000000000, max: 9999999999 }),
        gender: faker.helpers.arrayElement(["Male", "Female"]),
        password: "password",
        avatar: {
          url: faker.image.avatar(),
          public_id: faker.string.uuid(),
        },
      });

      usersPromise.push(tempUser);
    }

    await Promise.all(usersPromise);
    console.log(`Successfully created ${numUsers} users!`);
  } catch (error) {
    console.error("Error creating users:", error);
  }
};

// Uncomment to run directly
createUser(10);

//createSingleChats
export const createSingleChats = async (numChats) => {
  try {
    const users = await User.find().select("_id");
    const chatsPromise = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        chatsPromise.push(
          Chat.create({
            name: faker.lorem.words(2),
            members: [users[i], users[j]],
          })
        );
      }
    }
    await Promise.all(chatsPromise);
    console.log("Chats created successFully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//createGroupChats
export const createGroupChats = async (numChats) => {
  try {
    const users = await User.find().select("_id");
    const chatsPromise = [];
    for (let i = 0; i < numChats; i++) {
      const numMembers = simpleFaker.number.int({ min: 3, max: users.length });
      const members = [];

      for (let i = 0; i < numMembers; i++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const randomUser = users[randomIndex];
        if (!members.includes(randomUser)) {
          members.push(randomUser);
        }
      }

      const chat = Chat.create({
        groupChat: true,
        name: faker.lorem.words(1),
        members,
        creator: members[0],
      });
      chatsPromise.push(chat);
    }
    await Promise.all(chatsPromise);
    console.log("chats created successFully!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//createMessages
export const createMessages = async (numMessages) => {
  try {
    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id");

    const messagesPromise = [];
    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChat = chats[Math.floor(Math.random() * chats.length)];

      messagesPromise.push(
        Message.create({
          chat: randomChat,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagesPromise);
    console.log("Messages crated successFully!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//createMessagesInAChat
export const createMessagesInAChat = async (chatId, numMessages) => {
  try {
    const users = await User.find().select("_id");
    const messagesPromise = [];
    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      messagesPromise.push(
        Message.create({
          chat: chatId,
          sender: randomUser,
          content: faker.lorem.sentence(),
        })
      );
    }

    await Promise.all(messagesPromise);
    console.log("Messages created successFully!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
