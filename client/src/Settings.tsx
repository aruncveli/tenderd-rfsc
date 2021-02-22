import React, { useEffect, useState } from "react";
import firebaseApp from "./firebase";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";

const functions = firebaseApp.functions();
const auth = firebaseApp.auth();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      width: "200px"
    },
    select: {
      width: "200px"
    },
  })
);

function Settings() {
  const classes = useStyles();

  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName);
  const [users, setUsers] = useState([]);

  function submitUserDetails() {
    functions.httpsCallable("setUserDetails")(company);
    auth.currentUser?.updateProfile({
      displayName: displayName,
    });
  }

  async function deleteUser(index: number) {
    const userToDelete = users[index];
    setUsers([...users.slice(0, index), ...users.slice(index + 1)]);
    await functions.httpsCallable("deleteUser")({
      email: userToDelete["email"],
    });
  }

  const handleChangeSelectCompany = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCompany(event.target.value as string);
  };

  const handleChangesInputDisplayName = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setDisplayName(event.target.value as string);
  };

  useEffect(() => {
    async function getCompanies() {
      const result = await functions.httpsCallable("getCompanies")();
      setCompanies(result.data);
    }
    async function getUserDetails() {
      const result = await functions.httpsCallable("getUserDetails")();
      setCompany(result.data["company"]);
    }
    async function getUsersExceptThis() {
      const result = await functions.httpsCallable("getUsersExceptThis")();
      setUsers(result.data);
    }
    getCompanies();
    getUserDetails();
    getUsersExceptThis();
  }, []);

  return (
    <div>
      <TextField
        id="name-field"
        label="Name"
        variant="outlined"
        className={classes.input}
        value={displayName}
        onChange={handleChangesInputDisplayName}
      />
      <FormControl variant="outlined">
        <InputLabel>Company</InputLabel>
        <Select
          value={company}
          onChange={handleChangeSelectCompany}
          label="Company"
          className={classes.select}
        >
          {companies.map((company) => (
            <MenuItem value={company["name"]}>{company["name"]}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => submitUserDetails()}
      >
        Submit
      </Button>
      <div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((users, index) => (
                <TableRow key={users["email"]}>
                  <TableCell>{users["displayName"]}</TableCell>
                  <TableCell>{users["email"]}</TableCell>
                  <TableCell>{users["company"]}</TableCell>
                  <TableCell>
                    <Button onClick={() => deleteUser(index)}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Settings;
