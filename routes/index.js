import { Router } from 'express';
import loginController from '../controllers/loginController.js';
import unloggedMid from '../middlewares/unloggedMid.js';
import loggedMid from '../middlewares/loggedMid.js';
import { assistantDelete, assistantGet, assistantPost, assistantPut, assistantPutDisableEnable } from '../controllers/assistantController.js';
import { attendanceDelete, attendanceGet, attendancePost, attendancePut } from '../controllers/attendanceController.js';
import { leaveDelete, leaveGet, leavePost, leavePut } from '../controllers/leaveController.js';
import { RFIDDelete, RFIDEnrollPut, RFIDGet, RFIDPost, RFIDPut } from '../controllers/RFIDController.js';
import exportController from '../controllers/exportController.js';
import RFIDFetchController from '../controllers/RFIDFetchController.js';
import timeController from '../controllers/timeController.js';

const router = Router();

router.post('/login', (req, res, next) => unloggedMid(req, res, next), loginController)
router.post('/rfidFetch', (req, res, next) => unloggedMid(req, res, next), RFIDFetchController)
router.get('/time', (req, res, next) => unloggedMid(req, res, next), timeController)
router.get('/export', (req, res, next) => loggedMid(req, res, next), exportController)

router.post('/assistant', (req, res, next) => loggedMid(req, res, next), assistantPost)
router.put('/assistant', (req, res, next) => loggedMid(req, res, next), assistantPut)
router.put('/assistant/disableEnable', (req, res, next) => loggedMid(req, res, next), assistantPutDisableEnable)
router.get('/assistant', (req, res, next) => unloggedMid(req, res, next), assistantGet)
router.delete('/assistant', (req, res, next) => loggedMid(req, res, next), assistantDelete)

router.post('/attendance', (req, res, next) => unloggedMid(req, res, next), attendancePost)
router.put('/attendance', (req, res, next) => loggedMid(req, res, next), attendancePut)
router.get('/attendance', (req, res, next) => unloggedMid(req, res, next), attendanceGet)
router.delete('/attendance', (req, res, next) => loggedMid(req, res, next), attendanceDelete)

router.post('/leave', (req, res, next) => unloggedMid(req, res, next), leavePost)
router.put('/leave', (req, res, next) => unloggedMid(req, res, next), leavePut)
router.get('/leave', (req, res, next) => unloggedMid(req, res, next), leaveGet)
router.delete('/leave', (req, res, next) => unloggedMid(req, res, next), leaveDelete)

router.post('/rfid', (req, res, next) => loggedMid(req, res, next), RFIDPost)
router.get('/rfid', (req, res, next) => loggedMid(req, res, next), RFIDGet)
router.put('/rfid', (req, res, next) => loggedMid(req, res, next), RFIDPut)
router.put('/rfid/enroll', (req, res, next) => loggedMid(req, res, next), RFIDEnrollPut)
router.delete('/rfid', (req, res, next) => loggedMid(req, res, next), RFIDDelete)

export default router;
