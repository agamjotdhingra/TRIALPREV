import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import prescriptionsRouter from "./prescriptions";
import documentsRouter from "./documents";
import labsRouter from "./labs";
import reportsRouter from "./reports";
import hospitalsRouter from "./hospitals";
import wardsRouter from "./wards";
import bedsRouter from "./beds";
import admissionsRouter from "./admissions";
import staffRouter from "./staff";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(prescriptionsRouter);
router.use(documentsRouter);
router.use(labsRouter);
router.use(reportsRouter);
router.use(hospitalsRouter);
router.use(wardsRouter);
router.use(bedsRouter);
router.use(admissionsRouter);
router.use(staffRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;
