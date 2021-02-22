/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

import * as express from "express";
const cors = require("cors");
const app = express();

import firebase from "firebase";
const firebaseConfig = {
  apiKey: "AIzaSyBXXDCkMM_wW-E8LMe5Yo7GAvpKxcUwl30",
  authDomain: "tenderd-rfsc.firebaseapp.com",
  databaseURL:
    "https://tenderd-rfsc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tenderd-rfsc",
  storageBucket: "tenderd-rfsc.appspot.com",
  messagingSenderId: "1041703231126",
  appId: "1:1041703231126:web:8bc6fdd88b9c449e39acb7",
  measurementId: "G-0LZDN1848X",
};

firebase.initializeApp(firebaseConfig);
const validateCredentials = async (req: any, res: any, next: any) => {
  firebase.auth()
      .signInWithEmailAndPassword(req.headers.email, req.headers.password)
      .then(() => next())
      .catch((err) => {
        res.status(403).send("Unauthorized");
        return;
      });
};

app.use(cors({origin: true}));
app.use(validateCredentials);

app.get("/hello", (req, res) => {
  res.send("Hello you");
  // Call the content of any below callable HTTPS functions for implementing
  // REST APIs
});

function timeDifference(date1: number, date2: number) {
  let difference = date1 - date2;

  const daysDifference = Math.floor(difference/1000/60/60/24);
  difference -= daysDifference*1000*60*60*24;

  const hoursDifference = Math.floor(difference/1000/60/60);
  difference -= hoursDifference*1000*60*60;

  const minutesDifference = Math.floor(difference/1000/60);
  difference -= minutesDifference*1000*60;

  return daysDifference + "d " +
  hoursDifference + "h " + minutesDifference + "m";
}

export const api = functions.https.onRequest(app);

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs 1", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const getCompanies = functions.https.onCall(
    async (data, context) => {
      functions.logger.info("getCompanies", {structuredData: true});
      const snapshot = await db.collection("companies").get();
      return snapshot.docs.map((doc) => doc.data());
    }
);

export const getUsers = functions.https.onCall(async (data, context) => {
  functions.logger.info("getUsers", {structuredData: true});
  const company = data?.company;
  let snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
  if (company == "" || company == undefined) {
    snapshot = await db.collection("users").get();
  } else {
    snapshot = await db
        .collection("users")
        .where("company", "==", company)
        .get();
  }
  return snapshot.docs.map((doc) => doc.data());
});

export const getUsersExceptThis = functions.https.onCall(
    async (data, context) => {
      functions.logger.info("getUsersExceptThis", {structuredData: true});
      const email = context.auth?.token.email;
      const usersSnapshot = await db.
          collection("users").where("email", "!=", email).get();
      return await Promise.all(usersSnapshot.docs.map(async (userSnapshot) => {
        const companyRef = userSnapshot.get("company");
        const companySnapshot = await companyRef.get();
        return {
          displayName: userSnapshot.get("displayName"),
          email: userSnapshot.get("email"),
          company: companySnapshot.get("name"),
        };
      }));
    }
);

export const getUserDetails = functions.https.onCall(
    async (data, context) => {
      functions.logger.info("getUserDetails", {structuredData: true});
      const email = context.auth?.token.email;
      const userSnapshot = (await db.
          collection("users").where("email", "==", email).get()).docs[0];
      const companyRef = userSnapshot.get("company");
      const companySnapshot = await companyRef.get();
      return {
        company: companySnapshot.get("name"),
      };
    }
);

export const setUserDetails = functions.https.onCall(
    async (data, context) => {
      functions.logger.info("setUserDetails", {structuredData: true});
      const companyId = (await db.collection("companies")
          .where("name", "==", data).get()).docs[0].id;
      const email = context.auth?.token.email;
      const user = await db.collection("users")
          .where("email", "==", email).get();
      if (user.empty) {
        db.collection("users").doc().set({
          email: email,
          company: db.doc("companies/" + companyId),
          displayName:
              (await admin.auth().getUser(context.auth?.token.uid as string))
                  .displayName,
        });
      } else {
        const userSnapshotId = user.docs[0].id;
        await db.collection("users").doc(userSnapshotId).update({
          company: db.doc("companies/" + companyId),
        });
      }
    }
);

export const deleteUser = functions.https.onCall(
    async (data, context) => {
      const userId = (await auth.getUserByEmail(data.email)).uid;
      await auth.deleteUser(userId);
      const userDocId = (await db.collection("users")
          .where("email", "==", data.email).get()).docs[0].id;
      await db.collection("users").doc(userDocId).delete();
    }
);

export const submitRequest = functions.https.onCall(
    async (data, context) => {
      functions.logger.info("submitRequest", {structuredData: true});
      const timestamp = Date.now();
      const request = await db.collection("requests").add(data);
      await request.update({
        created: timestamp,
        id: timestamp + (context.auth?.token.uid as string),
        type: data.type,
        description: data.description,
        status: data.status,
        company: data.company,
        user: data.user,
      });
    }
);

export const updateRequest = functions.https.onCall(
    async (data, context) => {
      const requestSnapshot = await db.collection("requests")
          .where("id", "==", data.id).get();
      const requestRef = requestSnapshot.docs[0].ref;
      if (data.status == "Cancelled" || data.status == "Completed") {
        requestRef.update({
          done: Date.now(),
          type: data.type,
          description: data.description,
          status: data.status,
          company: data.company,
          user: data.user,
        });
      } else {
        requestRef.update({
          type: data.type,
          description: data.description,
          status: data.status,
          company: data.company,
          user: data.user,
        });
      }
    }
);

export const getRequests = functions.https.onCall(
    async (data, context) => {
      const userSnapshot = (await db.collection("users")
          .where("displayName", "==", data.displayName).get()).docs[0];
      const userCompany = await userSnapshot.get("company");
      const userCompanyName = (await userCompany.get()).get("name");
      const userRequests = await db.collection("requests")
          .where("user", "==", data.displayName)
          .where("company", "!=", userCompanyName).get();
      const userCompanyRequests = await db.collection("requests")
          .where("company", "==", userCompanyName).get();
      const result = userRequests.docs.concat(userCompanyRequests.docs);
      return result.map((request) => {
        let time: string;
        if (request.get("done") == "" || request.get("done") == undefined) {
          time = timeDifference(Date.now(), request.get("created"));
        } else {
          time = timeDifference(request.get("done"), request.get("created"));
        }
        return {
          description: request.get("description"),
          type: request.get("type"),
          user: request.get("user"),
          company: request.get("company"),
          status: request.get("status"),
          time: time,
        };
      });
    }
);
