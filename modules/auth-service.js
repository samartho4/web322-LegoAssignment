const mongoose = require("mongoose");
const env = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

env.config(path.join(__dirname, "../.env"));

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  password: { type: String },
  email: {
    type: String,
  },
  loginHistory: [
    {
      dateTime: {
        type: Date,
      },
      userAgent: {
        type: String,
      },
    },
  ],
});

let User;

// ------------------------------------

function initialize() {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(process.env.MONGODB);
    db.on("error", (err) => {
      console.error("Database connection error:", err);
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("User not created - passwords do not match.");
    }

    bcrypt
      .hash(userData.password, 10)
      .then((hash) => {
        userData.password = hash;

        let newUser = new User(userData);
        newUser
          .save()
          .then(() => {
            resolve("User successfully created.");
          })
          .catch((err) => {
            if (err.code === 11000) {
              console.log(err);
              reject("User not created - username is already taken.");
            } else {
              reject(`User not created - there was an error: ${err}.`);
            }
          });
      })
      .catch((err) => {
        console.log(err);
        reject("User not created - encryption error.");
      });
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt
            .compare(userData.password, user.password)
            .then((result) => {
              if (!result) {
                reject(`Incorrect Password for user: ${userData.userName}`);
              } else {
                if (user.loginHistory.length === 8) {
                  user.loginHistory.pop();
                }

                if (userData.userAgent && userData.userAgent !== "Unknown") {
                  user.loginHistory.unshift({
                    dateTime: new Date(),
                    userAgent: userData.userAgent,
                  });
                }

                User.updateOne(
                  { userName: user.userName },
                  { $set: { loginHistory: user.loginHistory } }
                )
                  .then(() => resolve(user))
                  .catch((err) =>
                    reject(
                      `There was an error updating the user history: ${err}`
                    )
                  );
              }
            })
            .catch((err) => {
              reject(`There was an error verifying the password: ${err}`);
            });
        }
      })
      .catch((err) => {
        reject(`Unable to find user: ${userData.userName} - ${err}`);
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
