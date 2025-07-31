import { tryCatchAsyncError } from "../../middlewares/tryCatchHandler.js";
import ErrorHandler from "../../utils/errorHandler.js";
import Chat from "../../models/chatModel/chat.js";
import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../../constants/event.js";
import { deleteFilesFromCloudinary, emitEvent } from "../../utils/features.js";
import { getOtherMember } from "../../lib/helper.js";
import User from "../../models/userModel/user.js";
import Message from "../../models/messageModel/message.js";

//createGroup
export const createGroupChat = tryCatchAsyncError(async (req, res, next) => {
  const { name, members } = req.body;

  if (members.length < 2) {
    return next(
      new ErrorHandler("Group Chat must have at least 3 members", 400)
    );
  }

  const allMembers = [...members, req.user];
  await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(201).json({
    success: true,
    message: "Group created!",
  });
});

//getMyChats
export const getMyChats = tryCatchAsyncError(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "name email avatar"
  );
  if (!chats) return next(new ErrorHandler("Chat not found!", 404));

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map(({ avatar }) => avatar.url)
        : [otherMember.avatar.url],
      name: groupChat ? name : otherMember.name,
      members: members.reduce((prev, curValue) => {
        if (curValue._id.toString() !== req.user.toString()) {
          prev.push(curValue._id);
        }
        return prev;
      }, []),
    };
  });
  return res.status(200).json({
    success: true,
    message: "Chat retrieve successFully!",
    data: transformedChats,
  });
});

//getMyGroups
export const getMyGroups = tryCatchAsyncError(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
    creator: req.user,
  }).populate("members", "name email avatar");

  const groups = chats.map(({ members, _id, groupChat, name }) => ({
    _id,
    groupChat,
    name,
    avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
  }));
  return res.status(200).json({
    success: true,
    message: "group Chat retrieve successFully!",
    data: groups,
  });
});

//addMembers
export const addMembers = tryCatchAsyncError(async (req, res, next) => {
  const { chatId, members } = req.body;

  if (!members || members.length < 1)
    return next(new ErrorHandler("Please provide members", 400));

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not Found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("The group chat not found", 400));

  if (
    !chat.creator ||
    !req.user ||
    chat.creator.toString() !== req.user._id.toString()
  )
    return next(new ErrorHandler("You are not allowed to add members", 403));

  const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
  const allNewMembers = await Promise.all(allNewMembersPromise);
  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);
  if (chat.members.length > 100)
    return next(new ErrorHandler("Group members limit reached", 400));

  await chat.save();

  const allUsersName = allNewMembers.map((i) => i.name).join(",");
  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added in the group`
  );
  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully!",
  });
});

//remove Members
export const removeMembers = tryCatchAsyncError(async (req, res, next) => {
  const { userId, chatId } = req.body;

  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);
  if (!chat) return next(new ErrorHandler("Chat not found!", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("The group chat not found", 400));

  if (
    !chat.creator ||
    !req.user ||
    chat.creator.toString() !== req.user._id.toString()
  )
    return next(new ErrorHandler("You are not allowed to add members", 403));

  if (chat.members.length <= 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));
  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );
  await chat.save();

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${userThatWillBeRemoved.name} has been removed from the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);
  return res.status(200).json({
    success: true,
    message: "Member removed successFully!",
  });
});

//leave Groups
export const leaveGroups = tryCatchAsyncError(async (req, res, next) => {
  const chatId = req.params.id;

  // Validate chat ID
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler("Invalid chat ID", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.groupChat) {
    return next(new ErrorHandler("This is not a group chat", 400));
  }

  // Ensure the user is part of the group
  if (!chat.members.includes(req.user._id.toString())) {
    return next(new ErrorHandler("You are not a member of this group", 403));
  }

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  );

  if (remainingMembers.length < 3) {
    return next(new ErrorHandler("Group must have at least 3 members", 400));
  }

  // Handle creator reassignment if leaving user is the creator
  if (chat.creator.toString() === req.user._id.toString()) {
    chat.creator = remainingMembers[0];
  }

  chat.members = remainingMembers;
  await chat.save();

  emitEvent(
    req,
    ALERT,
    chat.members,
    `User ${req.user.name} has left the group`
  );

  return res.status(200).json({
    success: true,
    message: `User ${req.user.name} has left the group`,
  });
});

// export const leaveGroups = tryCatchAsyncError(async (req, res, next) => {
//   const chatId = req.params.id;
//   const chat = await Chat.findById(chatId);
//   if (!chat) return next(new ErrorHandler("Chat not found", 404));
//   if (!chat.groupChat)
//     return next(new ErrorHandler("This is not a group chat", 400));
//   const remainingMembers = chat.members.filter(
//     (member) => member.toString() !== req.user._id.toString()
//   );

//   if (remainingMembers.length < 3)
//     return next(new ErrorHandler("Group must have at least 3 members", 400));
//   if (chat.creator.toString() === req.user._id.toString()) {
//     const randomElement = Math.floor(Math.random() * remainingMembers.length);
//     const newCreator = remainingMembers[randomElement];
//     chat.creator = newCreator;
//   }

//   chat.members = remainingMembers;
//   const [user] = await Promise.all([
//     User.findById(req.user, "name"),
//     chat.save(),
//   ]);

//   emitEvent(req, ALERT, chat.members, `User ${user.name} has left the group`);

//   return res.status(200).json({
//     success: true,
//     message: ` User ${user.name} left the group`,
//   });
// });

//sendAttachments
export const sendAttachments = tryCatchAsyncError(async (req, res, next) => {
  const { chatId } = req.body;
  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "name"),
  ]);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  const files = req.files || [];
  if (files.length < 1)
    return next(new ErrorHandler("Please provide attachments", 400));

  //upload files here

  const attachments = [];

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };
  const messageForRealTime = {
    ...messageForDB,
    sender: {
      _id: me._id,
      name: me.name,
      avatar: me.avatar,
    },
    chat: chatId,
  };
  const message = await Message.create(messageForDB);
  emitEvent(req, NEW_ATTACHMENT, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });
  res.status(200).json({
    success: true,
    message,
  });
});

//chat details
export const chatDetails = tryCatchAsyncError(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await Chat.findById(req.params.id)
      .populate("members", "name avatar")
      .lean();
    if (!chat) return next(new ErrorHandler("Chat not found!", 404));

    chat.members = chat.members.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: avatar.url,
    }));

    return res.status(200).json({
      success: true,
      message: "chat retrieve successFully!",
      chat,
    });
  } else {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    return res.status(200).json({
      success: true,
      message: "message retrieve successFully!",
      chat,
    });
  }
});

//rename Group
export const renameGroup = tryCatchAsyncError(async (req, res, next) => {
  const chatId = req.params.id;
  const { name } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));
  if (chat.creator.toString() !== req.user._id.toString())
    return next(
      new ErrorHandler("You are not allowed to rename the group", 403)
    );
  chat.name = name;
  await chat.save();
  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Group renamed successFully!",
  });
});

//delete Chat
export const deleteChat = tryCatchAsyncError(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("chat not found", 404));

  const members = chat.members;
  if (chat.groupChat && chat.creator.toString() !== req.user._id.toString())
    return next(
      new ErrorHandler("You are not allowed to delete the group", 403)
    );
  if (!chat.groupChat && !chat.members.includes(req.user._id.toString())) {
    return next(
      new ErrorHandler("You are not allowed to delete the chat", 403)
    );
  }

  //remove cloudinary also
  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });
  const public_ids = [];

  messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

  await Promise.all([
    //delete files from cloudinary
    deleteFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);
  emitEvent(req, REFETCH_CHATS, members);
  return res.status(200).json({
    success: true,
    message: "Chat deleted successFully!",
  });
});

//getMessages
export const getMessages = tryCatchAsyncError(async (req, res, next) => {
  const chatId = req.params.id;
  const { page = 1 } = req.query;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;
  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "name avatar")
      .lean(),
    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;
  return res.status(200).json({
    success: true,
    message: messages.reverse(),
    totalPages,
  });
});
