import express from 'express'
import { followAndUnfollow, getSuggestedUser, loginUser, logoutUser, registerUser, updateUserProfile, userProfile } from '../../controllers/userController/user.Controller.js'
import userAuthentication from '../../middleware/userAuth.middleware.js'
import upload from '../../utils/Multer/multer.js'
const router = express.Router()


router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
// {userAuthentication} is check the user is login or not
router.route('/:id/profile').get(userAuthentication, userProfile) 
router.route('/profile/edit').post(userAuthentication, upload.single('profileImg'), updateUserProfile)
router.route('/suggested').get(userAuthentication, getSuggestedUser)
router.route('/followorunfollow/:id').post(userAuthentication, followAndUnfollow)

export default router