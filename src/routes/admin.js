const router = require('express').Router();
const { isNotLogin, isLogin } = require('./../middleware/adminMiddleware');
const {
    AuthController,
    CategoryController,
    SubcategoryController,
    ScholarshipController,
    ExtraAndCommonController,
    AdminController,
    HeaderMenuController,
    BestScholarshipController,
    SubjectController,
    UserController,
    ApiUserController
} = require('./../controllers/admin');


router.get('/login', isNotLogin, AuthController.loginWeb);

router.post('/login', isNotLogin, AuthController.loginPost);


router.get('/logout', isLogin, AuthController.logout);

// dashboard
router.get('/', isLogin, ExtraAndCommonController.dashboardWeb);

router.get('/app-detail', isLogin, ExtraAndCommonController.appDetailWeb);
router.post('/update-app-detail', isLogin, ExtraAndCommonController.updateAppDetailPost);



// category
router.get('/add-category', isLogin, CategoryController.addCategoryWeb);

router.post('/add-category', isLogin, CategoryController.addCategoryPost);

router.get('/category-list', isLogin, CategoryController.categoryListWeb);
// router.get('/category-list/:page', isLogin, CategoryController.categoryListWeb);

router.get('/delete-category/:id', isLogin, CategoryController.deleteCategory);

router.get('/update-category/:id', isLogin, CategoryController.updateCategoryWeb);

router.post('/update-category/:id', isLogin, CategoryController.updateCategoryPost);

// subcategory
router.get('/subcategory-list', isLogin, SubcategoryController.subcategoryListWeb);
router.get('/subcategory-list/:page', isLogin, SubcategoryController.subcategoryListWeb);

router.get('/add-subcategory', isLogin, SubcategoryController.addSubcategoryWeb);

router.post('/add-subcategory', isLogin, SubcategoryController.addSubcategoryPost);

router.get('/delete-subcategory/:id', isLogin, SubcategoryController.deleteSubcategory);

router.get('/update-subcategory/:id', isLogin, SubcategoryController.updateSubcategoryWeb);

router.post('/update-subcategory/:id', isLogin, SubcategoryController.updateSubcategoryPost);

router.get('/subcategory-by-category-id/:id', isLogin, SubcategoryController.subcategoryByCategoryId);


// scholarship
router.get('/scholarship-list', isLogin, ScholarshipController.scholarshipListWeb);
router.get('/active-scholarship-list', isLogin, ScholarshipController.activeScholarshipListWeb);
router.get('/inactive-scholarship-list', isLogin, ScholarshipController.inactiveScholarshipListWeb);
router.get('/always-open-scholarship-list', isLogin, ScholarshipController.alwaysOpenScholarshipListWeb);

router.get('/add-scholarship', isLogin, ScholarshipController.addScholarshipWeb);

router.post('/add-scholarship', isLogin, ScholarshipController.addScholarshipPost);

router.get('/delete-scholarship/:id', isLogin, ScholarshipController.deleteScholarship);

router.get('/update-scholarship/:id', isLogin, ScholarshipController.updateScholarshipWeb);

router.post('/update-scholarship/:id', isLogin, ScholarshipController.updateScholarshipPost);

// router.get('/save-to-archive-scholarship/:id', isLogin, ScholarshipController.saveToArchivescholarshipGet);
router.get('/save-to-inactive-scholarship/:id', isLogin, ScholarshipController.saveToInactivecholarshipGet);

router.get('/add-scholarship-via-file', isLogin, ScholarshipController.addScholarshipViaFileGet);

router.post('/add-scholarship-via-file', isLogin, ScholarshipController.addScholarshipViaFilePost);

router.get('/matched-user/:id', isLogin, ScholarshipController.matchedUserViaScholarshipWeb);

router.post('/send-sms-alert', isLogin, ScholarshipController.sendSmsAlert);

// comman and extra

router.get('/upload-file', isLogin, ExtraAndCommonController.uploadNewFileWeb);

router.post('/upload-file', isLogin, ExtraAndCommonController.uploadNewFilePost);

router.post('/delete-all-list-by-ids', isLogin, ExtraAndCommonController.deleteAllListById);


// admin
router.get('/add-admin', isLogin, AdminController.addAdminWeb);
router.post('/add-admin', isLogin, AdminController.addAdminPost);

router.get('/admin-list', isLogin, AdminController.adminListWeb);
router.get('/admin-list/:page', isLogin, AdminController.adminListWeb);

router.post('/change-admin-password/:id', isLogin, AdminController.changePasswordPost)

router.get('/update-admin/:id', isLogin, AdminController.updateAdminWeb);
router.post('/update-admin/:id', isLogin, AdminController.updateAdminPost);

router.get('/delete-admin/:id', isLogin, AdminController.deleteAdminWeb);


// header menu
router.get('/header-menu-list', isLogin, HeaderMenuController.headerMenuListWeb);
router.get('/add-header-menu', isLogin, HeaderMenuController.addHeaderMenuWeb);
router.post('/add-header-menu', isLogin, HeaderMenuController.addHeaderMenuPost);
router.get('/update-header-menu/:id', isLogin, HeaderMenuController.updateHeaderMenuWeb);
router.post('/update-header-menu/:id', isLogin, HeaderMenuController.updateHeaderMenuPost);
router.get('/delete-header-menu/:id', isLogin, HeaderMenuController.deleteHeaderMenuPost);


// best scholarship
router.get('/best-scholarship-list', isLogin, BestScholarshipController.bestScholarshipListWeb);
router.get('/add-best-scholarship', isLogin, BestScholarshipController.addBestScholarshipWeb);
router.post('/add-best-scholarship', isLogin, BestScholarshipController.addBestScholarshipPost);
router.get('/update-best-scholarship/:id', isLogin, BestScholarshipController.updateBestScholarshipWeb);
router.post('/update-best-scholarship/:id', isLogin, BestScholarshipController.updateBestScholarshipPost);
router.get('/delete-best-scholarship/:id', isLogin, BestScholarshipController.deleteBestScholarshipWeb);


// subject
router.get('/subject-list', isLogin, SubjectController.subjectListWeb);
router.get('/add-subject', isLogin, SubjectController.addSubjectWeb);
router.post('/add-subject', isLogin, SubjectController.addSubjectPost);
router.get('/update-subject/:id', isLogin, SubjectController.updateSubjectWeb);
router.post('/update-subject/:id', isLogin, SubjectController.updateSubjectPost);
router.get('/delete-subject/:id', isLogin, SubjectController.deleteSubjectGet);


// user
router.get('/master-account-list', isLogin, UserController.masterListWeb);
router.get('/user-list/:id', isLogin, UserController.userListWeb);
router.get('/delete-user/:id', isLogin, UserController.deleteUserGet);
router.get('/add-user-via-file', isLogin, UserController.addUserViaFileGet);
router.post('/add-user-via-file', isLogin, UserController.addUserViaFilePost);

// contact
router.get('/contact-list', isLogin, ExtraAndCommonController.contactListWeb);

// contact
router.get('/career-list', isLogin, ExtraAndCommonController.careerListWeb);

// api user
router.get('/api-user-list', isLogin, ApiUserController.apiUserListWeb);
router.get('/add-api-user', isLogin, ApiUserController.addApiUserWeb);
router.post('/add-api-user', isLogin, ApiUserController.addApiUserPost);
router.get('/enable-api-user-status/:id', isLogin, ApiUserController.enableApiUserStatus);
router.get('/disable-api-user-status/:id', isLogin, ApiUserController.disableApiUserStatus);


module.exports = router;