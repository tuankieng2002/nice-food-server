const { expressjwt: jwt } = require("express-jwt");

function authJwt(){
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ['HS256'],
        //to validate admin
        isRevoked: isRevoked
    }).unless({
        //loai trừ
        //https://regex101.com/r/x4TO5x/1
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET','OPTIONS']},
            { url: /\/api\/v1\/products(.*)/, methods: ['GET','OPTIONS', 'DELETE', 'POST', 'PUT']},
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET','OPTIONS']},
            { url: /\/api\/v1\/users(.*)/, methods: ['GET','OPTION','DELETE']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

/**async function isRevoked(req, payload, done) {
    if(!payload.isAdmin){
        done(null,true)
    }
    done();
}**/
//https://stackoverflow.com/questions/72117000/express-jwt-typeerror-done-is-not-a-function
async function isRevoked(req, token){
    if(!token.payload.isAdmin) {
       return true;
    }
}

module.exports = authJwt;

