#DevTinder APIs

#authRouter:
-POST /signup
-POST /login
-POST /logout

#profileRouter:
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

#connectionRequestRouter
-POST /requets/send/interested/:userId
-POST /requets/send/ignored/:userId
-POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId

#userRouter:
-GET /connections
-GET /requests/recieved
-GET /feed -gets you the profile of other users of platform
