const bcrypt = require('bcryptjs')

module.exports = {

    register: async (req, res) => {
        const db = req.app.get('db')
        const {username, password} = req.body

        const result = await db.user.find_user_by_username([username])
        const existingUser = result[0]
        if (existingUser){
            return res.status(409).send("Username already exists")
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        const registeredUser = await db.user.create_user([username, hash, `https://robohash.org/${username}.png`])
        const user = registeredUser[0]
        req.session.user={id: user.id, username: user.username, profile_pic: user.profile_pic}
        return res.status(200).send(req.session.user)
        
    },

    login: async (req, res) => {
        const {username, password} = req.body 
        const foundUser = await req.app.get('db').user.find_user_by_username({username})
        const user = foundUser[0]

        if(!user){
            return res.status(404).send("User was not found.")
        }
        const isAuthenticated = bcrypt.compareSync(password, user.hash)
        if (!isAuthenticated){
            return res.status(403).send("Wrong Password")
        }
        req.session.user = {id:user.id, username: user.username, profile_pic: `https://robohash.org/${username}.png`}
        return res.status(200).send(req.session.user)

    },

    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    },



    getUser: (req, res) => {
        if(!req.session.user){
            return res.status(404).send("User was not found")
        }
        return res.status(200).send(req.session.user)
    }
















}