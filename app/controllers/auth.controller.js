require("dotenv/config")
const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*exports.signup = (req, res) => {
    res.send("signup");
}*/

exports.signin = (req, res) => {
    // const genPass = bcrypt.hashSync(req.body.password, 8);
    // res.send(genPass);
    // const length = genPass.length;
    // console.log("Length of password: " + length);
    
    const { email, password } = req.body
    // console.log(email, password)
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        //Not found email in database, send an error with not found
        if (!user) {
            return res.status(404).json({
                message: "Email not found."
            })
        }

        let passwordIsValid = bcrypt.compareSync(
            req.body.password, //sent from frontend
            user.password //field in password in table user
        );
        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Password is invalid"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.SECRET_KEY,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: '1d'
            }
        );
        // console.log(token)
        let authorities = [];
        user.getRoles()
            .then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                //res.send(authorities);
                res.status(200).json({
                    id: user.id,
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email,
                    roles: authorities,
                    accessToken: token  //important
                });
            });
    }).catch(err => {
        res.status(500).json({ message: err.message });
    });
}