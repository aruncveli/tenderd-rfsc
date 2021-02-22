import { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import EditIcon from "@material-ui/icons/Edit";

import { DropzoneDialog } from "material-ui-dropzone";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import firebaseApp from "./firebase";
const functions = firebaseApp.functions();
const auth = firebaseApp.auth();
const storageRef = firebaseApp.storage().ref();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    newButton: {
      textAlign: "center"
    },
    select: {
      width: "200px"
    },
  })
);

function Requests() {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState<File[]>([]);
  const [requests, setRequests] = useState([]);
  const [isNewRequest, setIsNewRequest] = useState(true);
  const [id, setId] = useState("");

  const handleClickOpen = () => {
    setIsNewRequest(true);
    setType("");
    setDescription("");
    setUser("");
    setCompany("");
    setStatus("");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeRequestType = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setType(event.target.value as string);
  };
  const handleChangeRequestDescription = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setDescription(event.target.value as string);
  };
  const handleChangeRequestStatus = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setStatus(event.target.value as string);
  };
  const handleChangeSelectCompany = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCompany(event.target.value as string);
  };
  const handleChangeSelectUser = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setUser(event.target.value as string);
  };

  useEffect(() => {
    async function getCompanies() {
      const result = await functions.httpsCallable("getCompanies")();
      setCompanies(result.data);
    }
    async function getUsers() {
      const result = await functions.httpsCallable("getUsers")();
      setUsers(result.data);
    }
    async function getRequests() {
      const result = await functions.httpsCallable("getRequests")({
        displayName: auth.currentUser?.displayName,
      });
      setRequests(result.data);
    }
    getCompanies();
    getUsers();
    getRequests();
  }, []);

  async function submitRequest() {
    if (isNewRequest) {
      const requestId = Date.now() + (auth.currentUser?.uid as string);
      files.forEach((file) => {
        console.log(file.name);
        storageRef.child(requestId + "/" + file.name).put(file);
      });
      await functions.httpsCallable("submitRequest")({
        type: type,
        description: description,
        status: status,
        company: company,
        user: user,
      });
      handleClose();
    } else {
      await functions.httpsCallable("updateRequest")({
        id: id,
        type: type,
        description: description,
        status: status,
        company: company,
        user: user,
      });
    }
  }

  async function editRow(index: number) {
    setType(requests[index]["type"]);
    setDescription(requests[index]["description"]);
    setUser(requests[index]["user"]);
    setCompany(requests[index]["company"]);
    setStatus(requests[index]["status"]);
    setId(requests[index]["id"]);
    setIsNewRequest(false);
    setOpen(true);
  }

  return (
    <div>
      <div className={classes.newButton}>
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          New Request
        </Button>
      </div>
      <Dialog open={open} onClose={handleClose}>
        {isNewRequest ? (
          <DialogTitle>New Request</DialogTitle>
        ) : (
          <DialogTitle>Edit Request</DialogTitle>
        )}
        <DialogContent>
          <FormControl variant="outlined">
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              onChange={handleChangeRequestType}
              label="Type"
              className={classes.select}
            >
              <MenuItem value={"Breakdown"}>Breakdown</MenuItem>
              <MenuItem value={"Maintenance"}>Maintenance</MenuItem>
              <MenuItem value={"Replacement"}>Replacement</MenuItem>
              <MenuItem value={"Demobilisation"}>Demobilisation</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description"
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={handleChangeRequestDescription}
          />
          <FormControl variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={handleChangeRequestStatus}
              label="Status"
              className={classes.select}
            >
              <MenuItem value={"Created"}>Created</MenuItem>
              <MenuItem value={"In progress"}>In progress</MenuItem>
              <MenuItem value={"Completed"}>Completed</MenuItem>
              <MenuItem value={"Cancelled"}>Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl id="company-select" variant="outlined">
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
          <FormControl id="company-select" variant="outlined">
            <InputLabel>User</InputLabel>
            <Select value={user} onChange={handleChangeSelectUser} label="User" className={classes.select}>
              {users.map((user) => (
                <MenuItem value={user["displayName"]}>
                  {user["displayName"]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </Button>

            <DropzoneDialog
              acceptedFiles={["image/*", "application/pdf"]}
              cancelButtonText={"cancel"}
              submitButtonText={"submit"}
              maxFileSize={5000000}
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
              onSave={(files) => {
                setFiles(files);
                setUploadOpen(false);
              }}
              showPreviews={true}
              showFileNamesInPreview={true}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => submitRequest()} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time Elapsed</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow>
                  <TableCell>{request["description"]}</TableCell>
                  <TableCell>{request["type"]}</TableCell>
                  <TableCell>{request["user"]}</TableCell>
                  <TableCell>{request["company"]}</TableCell>
                  <TableCell>{request["status"]}</TableCell>
                  <TableCell>{request["time"]}</TableCell>
                  <TableCell>
                    <Button onClick={() => editRow(index)}>
                      <EditIcon />
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

export default Requests;
