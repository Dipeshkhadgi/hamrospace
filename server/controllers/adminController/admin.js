import { tryCatchAsyncError } from "../../middlewares/tryCatchHandler.js";
import Chat from "../../models/chatModel/chat.js";
import Message from "../../models/messageModel/message.js";
import User from "../../models/userModel/user.js";
import ErrorHandler from "../../utils/errorHandler.js";

//allUsers(Admin)
export const allAdminUsers = tryCatchAsyncError(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } });

  if (!users || users.length === 0) {
    return next(new ErrorHandler("No users found", 404));
  }

  const transformedUsers = await Promise.all(
    users.map(async ({ name, email, avatar, role, gender, _id }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);
      return {
        name,
        email,
        avatar: avatar.url,
        role,
        gender,
        _id,
        groups,
        friends,
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: "All Users except Admins",
    data: transformedUsers,
  });
});

//allChats(Admin)
export const allChats = tryCatchAsyncError(async (req, res, next) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");
  if (!chats || chats.length === 0) {
    return next(new ErrorHandler("No chats found", 404));
  }

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await Chat.countDocuments({ chat: _id });
      return {
        _id,
        groupChat,
        name,
        creator,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator.name || "Unknown",
          avatar: creator.avatar.url || "Unknown",
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    success: true,
    data: transformedChats,
  });
});

//allMessages
export const allMessages = tryCatchAsyncError(async (req, res, next) => {
  const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");
  if (!messages || messages.length === 0) {
    return next(new ErrorHandler("No messages found", 404));
  }
  const transformedMessages = messages.map(
    ({ _id, sender, chat, content, attachments, createdAt }) => ({
      _id,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
      chat: chat._id,
      content,
      groupChat: chat.groupChat,
      createdAt,
      attachments,
    })
  );

  return res.status(200).json({
    success: true,
    data: transformedMessages,
  });
});

//getDashBoardStats
export const getDashBoardStats = tryCatchAsyncError(async (req, res, next) => {
  const [groupChat,userCount,messagesCount,totalChatsCount] = await Promise.all([
    Chat.countDocuments({ groupChat: true }),
    User.countDocuments(),
    Message.countDocuments(),
    Chat.countDocuments()
  ])

  const today = new Date();
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: { $gte: last7Days, $lt: today }
  }).select("createdAt");

  const messages = new Array(7).fill(0)
  const dayInMilliSeconds = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach(message => {
    const indexApprox =(today.getTime()-message.createdAt.getTime())/dayInMilliSeconds;
    const index = Math.floor(indexApprox);
    messages[6-index]++;
  
  }
  );

  const stats = {
    groupChat,
    userCount,
    messagesCount,
    messagesChat:messages,
    totalChatsCount,
  }

  return res.status(200).json({
    success: true,
    messages:"transformedMessages",
    data:stats,
 
  });
});