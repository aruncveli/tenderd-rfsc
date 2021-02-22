import React, { useEffect, useState } from "react";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import SettingsIcon from "@material-ui/icons/Settings";
import ListIcon from "@material-ui/icons/List";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import firebaseApp from "./firebase";
import firebase from "firebase";
import Settings from "./Settings";
import Requests from "./Requests";
import CompanyForm from "./CompanyForm";

const uiConfig = {
  signInFlow: "popup",
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  buttonGroup: {
    marginTop: "10px",
    width: 200,
    marginLeft: "auto",
    marginRight: "auto"
  },
  welcome: {
    textAlign: "center"
  }
});

function App() {
  const classes = useStyles();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [value, setValue] = useState("");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebaseApp
      .auth()
      .onAuthStateChanged((user) => {
        setIsSignedIn(!!user);
      });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  function signOut() {
    setValue("");
    firebaseApp.auth().signOut()
  }

  function getUserDisplayName() {
    return firebaseApp.auth().currentUser?.displayName;
  }

  function isFirstLogin() {
    const metadata = firebaseApp.auth().currentUser?.metadata;
    return metadata?.creationTime === metadata?.lastSignInTime;
  }

  if (!isSignedIn) {
    return (
      <div>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebaseApp.auth()}
        />
      </div>
    );
  }

  return (
    <div>
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6">
              Tenderd App
            </Typography>
            <Button color="inherit" onClick={() => signOut()}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </div>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        className={classes.buttonGroup}
      >
        <BottomNavigationAction
          label="Requests"
          value="requests"
          icon={<ListIcon />}
        />
        <BottomNavigationAction
          label="Settings"
          value="settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
      { value === "settings" && <Settings />}
      { value === "requests" && <Requests />}
      { value === "" && <p className={classes.welcome}>Welcome {getUserDisplayName()}!</p>}
      { isFirstLogin() && <CompanyForm/>}
    </div>
  );
}

export default App;
