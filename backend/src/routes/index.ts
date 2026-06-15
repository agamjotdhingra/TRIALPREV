import { Router } from 'express';
import authRouter from './auth.js';
import patientsRouter from './patients.js';
import doctorsRouter from './doctors.js';
import appointmentsRouter from './appointments.js';
import prescriptionsRouter from './prescriptions.js';
import labsRouter from './labs.js';
import reportsRouter from './reports.js';
import hospitalsRouter from './hospitals.js';
import admissionsRouter from './admissions.js';
import documentsRouter from './documents.js';
import notificationsRouter from './notifications.js';
import dashboardRouter from './dashboard.js';

const router = Router();

router.use(authRouter);
router.use(patientsRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(prescriptionsRouter);
router.use(labsRouter);
router.use(reportsRouter);
router.use(hospitalsRouter);
router.use(admissionsRouter);
router.use(documentsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;
