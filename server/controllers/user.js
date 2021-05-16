const bcrypt = require('bcryptjs')

module.exports = {

    register: async (req, res) => {
        const db = req.app.get('db')
        const {username, password} = req.body
        const {profile_pic} = (`https://robohash.org/${username}.png`)

        const [checkUsername] = await db.auth.find_user_by_username(username)
        if (checkUsername){
            return res.status(409).send("Username already exists")
        }

        const salt = bcrypt.genSaltSync(15)
        const hash = bcrypt.hashSync(password, salt)
        const [user] = await db.auth.create_user(username, hash, profile_pic)
        delete user.password
        req.session.user = user
        return res.status(200).send(req.session.user)
    },

    login: async (req, res) => {
        const db = req.app.get('db')
        const {username, password} = req.body
        const {profile_pic} = (`https://robohash.org/${username}.png`)

        const [user] = await db.auth.find_user_by_username(username)
        if(!user){
            return res.status(404).send("User was not found.")
        }
        const isAuthenticated = bcrypt.compareSync(password, user.password)
        if (!isAuthenticated){
            return res.status(403).send("Wrong Password")
        }
        delete user.password
        req.session.user = user
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