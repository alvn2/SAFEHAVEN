import { prisma } from '../db.js';

export const pruneOldChats = async (): Promise<{ deletedMessages: number; deletedConversations: number }> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    // 1. Delete all messages older than 7 days
    const messageResult = await prisma.message.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    });

    // 2. Find and delete conversations that have no messages left AND have been empty for > 7 days
    const emptyConversations = await prisma.conversation.findMany({
      where: {
        messages: {
          none: {}
        },
        lastMessageAt: {
          lt: sevenDaysAgo
        }
      },
      select: { id: true }
    });

    let deletedConversationsCount = 0;
    if (emptyConversations.length > 0) {
      const convIds = emptyConversations.map((c: { id: string }) => c.id);
      // Clean up participants first
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId: { in: convIds }
        }
      });
      const convResult = await prisma.conversation.deleteMany({
        where: {
          id: { in: convIds }
        }
      });
      deletedConversationsCount = convResult.count;
    }

    if (messageResult.count > 0 || deletedConversationsCount > 0) {
      console.log(`[PRUNING] Cleaned up ${messageResult.count} old messages and ${deletedConversationsCount} empty conversations.`);
    }

    return {
      deletedMessages: messageResult.count,
      deletedConversations: deletedConversationsCount
    };
  } catch (err) {
    console.error('[PRUNING ERROR] Failed to prune old messages:', err);
    return { deletedMessages: 0, deletedConversations: 0 };
  }
};

export const startPruningScheduler = (intervalHours = 24) => {
  // Run once on startup (deferred by 10s to let server settle)
  const initialTimer = setTimeout(() => {
    pruneOldChats();
  }, 10000);
  initialTimer.unref();

  // Run periodically
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const recurringTimer = setInterval(pruneOldChats, intervalMs);
  recurringTimer.unref();
};
