import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsQueryParams,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const params = ListNotificationsQueryParams.safeParse(req.query);
  let results = await db.select().from(notificationsTable);
  if (params.success) {
    if (params.data.recipientType) results = results.filter((n) => n.recipientType === params.data.recipientType);
    if (params.data.recipientId) results = results.filter((n) => n.recipientId === params.data.recipientId);
    if (params.data.isRead !== undefined) results = results.filter((n) => n.isRead === params.data.isRead);
  }
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(results);
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

export default router;
