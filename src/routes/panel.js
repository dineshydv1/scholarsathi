const router = require('express').Router();
const {
    HomeController,
    AuthController,
    ScholarshipController,
    UserController,
    ExtraAndCommonController
} = require('./../controllers/panel');
const { isLogin, isNotLogin } = require('./../middleware/panelMiddleware');

router.get('/about-us', HomeController.aboutUsWeb);

router.get('/', HomeController.homeWeb);

router.get('/contact-us', HomeController.contactUsWeb);
router.get('/careers', HomeController.careersWeb);
router.get('/term-and-conditions', HomeController.termAndConditions);


router.post('/register', AuthController.registerPost);

router.post('/login', AuthController.loginPost);

router.get('/logout', AuthController.logout);


// state
router.get('/get-cities/:stateId', ExtraAndCommonController.getCitiesByStateId);

// otp
router.get('/get-login-otp', AuthController.loginOtpGet);
router.post('/login-with-otp', AuthController.loginWithOtpPost);

// get forgot otp
router.get('/get-forgot-password-otp', AuthController.forgotPasswordOtpGet); 
router.post('/verify-forgot-password-otp', AuthController.verifyForgotPasswordOtp);

// auth
router.get('/get-mobile-verify-otp', isLogin, UserController.getMobileVerifyOtp);
router.post('/verify-mobile-with-otp', isLogin, UserController.verifyMobileWithOtp);


router.get('/get-email-verify-otp', isLogin, UserController.getEmailVerifyOtp);
router.post('/verify-email-with-otp', isLogin, UserController.verifyEmailWithOtp);

router.post('/change-mobile', isLogin, UserController.changeMobile);
router.post('/change-email', isLogin, UserController.changeEmail);



router.get('/dashboard', isLogin, HomeController.dashboardWeb);

router.get('/setting', isLogin, HomeController.settingWeb);


// scholarship
router.get('/scholarship-detail/:id', ScholarshipController.scholarshipDetailWeb);
router.get('/scholarship-detail/:id/:slug', ScholarshipController.scholarshipDetailWeb);

router.get('/scholarship-list', ScholarshipController.scholarshipListWeb);
router.get('/scholarship-list/:id', ScholarshipController.scholarshipListWeb);

router.post('/filter-scholarship', ScholarshipController.filterScholarshipPost);


router.get('/saved-scholarship-list', isLogin, ScholarshipController.savedScholarshipWeb);
router.get('/matched-scholarship-list', isLogin, ScholarshipController.matchedScholarshipWeb);


// profile
router.get('/my-profile', isLogin, UserController.myProfileWeb);

router.get('/document-list', isLogin, UserController.documentListWeb);
router.get('/delete-user-document/:id', isLogin, UserController.deleteUserDocument);

router.post('/profile-update/personal/:id', isLogin, UserController.updatePersonalData);
router.post('/profile-update/education/:id', isLogin, UserController.updateEducationData);
router.post('/profile-update/interest/:id', isLogin, UserController.updateInterestData);
router.post('/profile-update/create-another-account/:id', isLogin, UserController.createAnotherAccount);
router.post('/profile-update/scholarship-history/:id', isLogin, UserController.scholarshipHistory);
router.post('/profile-update/edit-scholarship-history/:id', isLogin, UserController.editScholarshipHistoryById);

router.get('/entrance-exam-list', isLogin, UserController.entranceExamListWeb);
router.post('/profile-update/entrance-exam/:id', isLogin, UserController.addUserEntranceExam);
router.post('/profile-update/edit-entrance-exam/:id', isLogin, UserController.editEntranceExamById);

router.post('/profile-update/profile-image/:id', isLogin, UserController.updateProfileImage);
router.post('/profile-update/add-user-document/:id', isLogin, UserController.addUserDocument);

router.post('/profile-update/change-password', isLogin, UserController.changePasswordPost);

router.get('/delete-scholarship-history/:id', isLogin, UserController.deleteUserScholarshipHistoryGet);
router.get('/delete-entrance-exam/:id', isLogin, UserController.deleteUserEntranceExamGet);

router.get('/login-as-child/:id', isLogin, UserController.loginAsChild);
router.get('/switch-to-parent', isLogin, UserController.switchToParent);

router.get('/become-premium-member', isLogin, UserController.becomePremiumMember);



router.get('/saved-scholarship/:id', isLogin, UserController.savedUnSavedScholarship);
router.get('/unsaved-scholarship/:id', isLogin, UserController.savedUnSavedScholarship);

router.get('/account-list', isLogin, UserController.accountList);
router.get('/scholarship-history-list', isLogin, UserController.scholarshipHistoryList);


// unbsubscribe email/sms
router.get('/unsubscribe-service', isLogin, UserController.unsubscribeServiceGet);

// subject
router.get('/get-subject/:educationId', isLogin, ExtraAndCommonController.getSubjectByEducationId);

// contact us
router.post('/contact-us', isLogin, ExtraAndCommonController.contactUsPost);

// career
router.post('/careers-form', isLogin, ExtraAndCommonController.careersFormPost);


module.exports = router;