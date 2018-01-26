const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080; // default port 8080
const morgan = require('morgan')
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require('cookie-session')

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000
}))

const urlDatabase = {};

const users = {};

function generateShortUrl() {
    const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let output = "";
    for (let i = 0; i < 6; i++) {
        let index = getRandomInt();
        output += vocabulary[index];
    }
    return output;
}

function getRandomInt() {
    min = Math.ceil(0);
    max = Math.floor(35);
    return Math.floor(Math.random() * (35 - 0)) + 0;
}

function removeItem(id) {
    for (let index in urlDatabase) {
        if (index == id) {
            delete urlDatabase[index]
        }
    }
}

function addUser(user, email, password) {
    let newUserKey = generateShortUrl()
    users[newUserKey] = { id: user, email: email, password: password }
}

function renameURL(longURL) {
    if (longURL.charAt(0) === "h" && longURL.charAt(8) === "w") {
        return longURL;
    } else if (longURL.charAt(0) === "w" && longURL.charAt(1) === "w" && longURL.charAt(2) === "w") {
        return longURL = ("http://" + longURL)
    } else if (longURL.charAt(0) !== "h" && longURL.charAt(8) !== "w") {
        return longURL = ("http://www." + longURL)
    }
}

function checkID(req, res) {
    let current_user = req.session.current_user
    for (let i in users) {
        if (users[i]["email"] === current_user) {
            return true;
        }

    }
    return false;
}

function creatCookie(email, req, res) {
    for (let i in users) {
        if (users[i]["email"] == email) {
            req.session.current_user = users[i]['email'];
        }
    }
}

app.get("/", (req, res) => {
    res.redirect("/urls/login/acess")
});

app.get("/urls", (req, res) => {
    let current_user = req.session.current_user
    if (checkID(req, res)) {
        let templateVars = {
            'websites': urlDatabase,
            'user': users,
            current_user
        }
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.post("/urls", (req, res) => {
    let current_user = req.session.current_user
    let shortURL = generateShortUrl();
    let newLongUrl = renameURL(req.body.longURL)
    if (checkID(req, res)) {
        urlDatabase[shortURL] = {
            "website": newLongUrl,
            "by": current_user
        }
        res.redirect("/urls")
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/urls/login/acess", (req, res) => {
    res.render("urls_login");
})

app.post("/urls/login/acess", (req, res) => {
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    for (let i in users) {
        if (users[i]["email"] === userEmail) {
            creatCookie(userEmail, req, res);
            res.redirect("/urls/")
            return;
        }
    }
    req.session = null;
    res.redirect("/urls/login/acess");
})

app.post("/urls/login/acess", (req, res) => {
    let emailInput = req.body.email;
    let passInput = req.body.password;
    for (let i in users) {
        if (users[i]["email"] === emailInput && bcrypt.compareSync(passInput, users[i]['password'])) {
            creatCookie(emailInput, req, res);
            res.redirect("/urls/")
            return;
        }
    }
    req.session = null;
    res.redirect("/urls/login/acess");
})

app.get("/urls/register", (req, res) => {
    res.render("urls_register");
});

app.post("/urls/register", (req, res) => {
    let newUserID = req.body.user;
    let newUserEmail = req.body.email;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    for (let i in users) {
        if (newUserEmail === users[i]['email']) {
            // res.clearCookie("id");
            req.session = null;
            res.redirect("/urls/login/acess");
            return;
        } else if (!newUserID || !newUserEmail || !hashedPassword) {
            res.redirect("/urls/error/400");
            return;
        }
    }
    addUser(newUserID, newUserEmail, hashedPassword);
    creatCookie(newUserEmail, req, res);
    res.redirect("/urls");
});

app.post("/urls/logoff", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
    if (checkID(req, res)) {
        res.render("urls_new");
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/urls/:id", (req, res) => {
    if (checkID(req, res)) {
        let templateVars = {
            shortURL: req.params.id,
            urls: urlDatabase,
            username: req.session.current_user
        };
        res.render("urls_show", templateVars);
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.post("/urls/:id", (req, res) => {
    let newURL = req.params.id;
    urlDatabase[newURL] = req.body.longURL;
    res.redirect("/urls");
});

app.post("/urls/edit/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        urls: urlDatabase,
        username: req.session.current_user
    };
    res.render("urls_show", templateVars);
});

app.post("/urls/delete/:id", (req, res) => {
    if (checkID(req, res)) {
        let id = req.params.id;
        removeItem(id);
        res.redirect("/urls");
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL
    let longURL = urlDatabase[shortURL]
    res.redirect(longURL);
});

app.get("/urls/error/400", (req, res) => {
    if (checkID(req, res)) {
        res.render("urls_error_400");
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});