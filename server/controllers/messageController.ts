import { Response } from 'express';
import { Message, User, Tree, Notification, Report } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { receiverId, treeId, content, messageType, mediaUrl, mediaName, locationData, offerData } = req.body;
    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required." });
    }

    const senderId = req.user!.userId;
    const senderUser = await User.findById(senderId);
    
    // Check if sender is blocked by receiver or vice versa
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ error: "Receiver user not found." });
    }

    if (receiverUser.blockedUserIds?.includes(senderId)) {
      return res.status(403).json({ error: "You cannot message this user." });
    }

    let treeName = "";
    if (treeId) {
      const tree = await Tree.findById(treeId);
      if (tree) {
        treeName = tree.name;
      }
    }

    const messageContent = content ? content.trim() : (messageType ? `Sent a ${messageType}` : '');

    const message = await Message.create({
      senderId,
      receiverId,
      treeId: treeId || "",
      treeName,
      content: messageContent,
      messageType: messageType || 'text',
      mediaUrl,
      mediaName,
      locationData,
      offerData
    });

    // Create Notification for receiver
    await Notification.create({
      userId: receiverId,
      title: `New Message from ${senderUser ? senderUser.name : 'User'}`,
      message: messageContent.length > 60 ? messageContent.substring(0, 60) + '...' : messageContent,
      type: messageType === 'offer' ? 'offer' : 'message',
      isRead: false
    });

    res.status(201).json(message);
  } catch (err: any) {
    console.error("SendMessage Error:", err);
    res.status(500).json({ error: "Failed to dispatch message." });
  }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { partnerId } = req.params;
    const { treeId } = req.query;
    const myId = req.user!.userId;

    const partnerUser = await User.findById(partnerId);
    const myUser = await User.findById(myId);

    // Retrieve messages exchanged between myId and partnerId
    const query: any = {
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId }
      ]
    };

    if (treeId) {
      query.treeId = treeId;
    }

    let chat = await Message.find(query);

    // Filter out messages deleted for myId
    chat = chat.filter(m => !m.deletedFor || !m.deletedFor.includes(myId));

    // Sort chronologically
    chat = [...chat].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Automatically mark partner messages as read
    await Message.markConversationAsRead(myId, partnerId);

    res.json({
      messages: chat,
      partner: partnerUser ? {
        id: partnerUser.id,
        name: partnerUser.name,
        role: partnerUser.role,
        contactNumber: partnerUser.contactNumber,
        isOnline: partnerUser.isOnline ?? true,
        lastSeen: partnerUser.lastSeen || partnerUser.createdAt,
        isBlocked: myUser?.blockedUserIds?.includes(partnerId) || false
      } : null
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve conversation history." });
  }
};

export const getConversationsList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const myId = req.user!.userId;
    const myUser = await User.findById(myId);
    const allMessages = await Message.find();
    
    // Filter messages where user is either sender or receiver
    const myMessages = allMessages.filter(
      (m) => (m.senderId === myId || m.receiverId === myId) && (!m.deletedFor || !m.deletedFor.includes(myId))
    );

    // Group by conversation partner
    const partnersMap = new Map<string, any>();

    for (const m of myMessages) {
      const partnerId = m.senderId === myId ? m.receiverId : m.senderId;
      const existing = partnersMap.get(partnerId);
      
      const isUnread = m.receiverId === myId && !m.isRead;

      if (!existing) {
        partnersMap.set(partnerId, {
          partnerId,
          lastMessage: m.content || (m.messageType ? `[${m.messageType}]` : ''),
          lastMessageAt: m.createdAt,
          messageType: m.messageType || 'text',
          treeId: m.treeId,
          treeName: m.treeName,
          unreadCount: isUnread ? 1 : 0
        });
      } else {
        if (isUnread) existing.unreadCount += 1;
        if (new Date(m.createdAt) > new Date(existing.lastMessageAt)) {
          existing.lastMessage = m.content || (m.messageType ? `[${m.messageType}]` : '');
          existing.lastMessageAt = m.createdAt;
          existing.messageType = m.messageType || 'text';
          existing.treeId = m.treeId || existing.treeId;
          existing.treeName = m.treeName || existing.treeName;
        }
      }
    }

    // Hydrate with user profile details
    const list = Array.from(partnersMap.values());
    const hydratedList = [];

    const archivedSet = new Set(myUser?.archivedChatPartnerIds || []);
    const blockedSet = new Set(myUser?.blockedUserIds || []);

    for (const item of list) {
      const partnerUser = await User.findById(item.partnerId);
      if (partnerUser) {
        hydratedList.push({
          ...item,
          partnerName: partnerUser.name,
          partnerRole: partnerUser.role,
          partnerContact: partnerUser.contactNumber,
          isOnline: partnerUser.isOnline ?? true,
          lastSeen: partnerUser.lastSeen || partnerUser.createdAt,
          isArchived: archivedSet.has(item.partnerId),
          isBlocked: blockedSet.has(item.partnerId)
        });
      }
    }

    // Sort by most recent message
    hydratedList.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    res.json(hydratedList);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to build messages dashboard." });
  }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const myId = req.user!.userId;
    const success = await Message.deleteForUser(messageId, myId);
    if (success) {
      res.json({ message: "Message deleted." });
    } else {
      res.status(404).json({ error: "Message not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message." });
  }
};

export const toggleArchiveChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { partnerId } = req.body;
    const myId = req.user!.userId;
    const myUser = await User.findById(myId);
    if (!myUser) return res.status(404).json({ error: "User not found" });

    let archivedList = myUser.archivedChatPartnerIds || [];
    if (archivedList.includes(partnerId)) {
      archivedList = archivedList.filter(id => id !== partnerId);
    } else {
      archivedList.push(partnerId);
    }

    await User.findByIdAndUpdate(myId, { archivedChatPartnerIds: archivedList });
    res.json({ success: true, archived: archivedList.includes(partnerId) });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle archive status." });
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId } = req.body;
    const myId = req.user!.userId;
    const myUser = await User.findById(myId);
    if (!myUser) return res.status(404).json({ error: "User not found" });

    let blockedList = myUser.blockedUserIds || [];
    if (blockedList.includes(targetUserId)) {
      blockedList = blockedList.filter(id => id !== targetUserId);
    } else {
      blockedList.push(targetUserId);
    }

    await User.findByIdAndUpdate(myId, { blockedUserIds: blockedList });
    res.json({ success: true, blocked: blockedList.includes(targetUserId) });
  } catch (err) {
    res.status(500).json({ error: "Failed to block user." });
  }
};

export const reportUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId, reason } = req.body;
    const myId = req.user!.userId;

    const report = await Report.create({
      reporterId: myId,
      reportedUserId: targetUserId,
      reason: reason || 'Inappropriate behavior'
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "Failed to report user." });
  }
};

export const updatePresence = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const myId = req.user!.userId;
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(myId, {
      isOnline: isOnline !== undefined ? isOnline : true,
      lastSeen: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update presence." });
  }
};
