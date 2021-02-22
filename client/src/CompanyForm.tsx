import { useEffect, useState } from "react";

import firebaseApp from "./firebase";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

const functions = firebaseApp.functions();

function CompanyForm() {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [open, setOpen] = useState(true);

  const handleChangeSelectCompany = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCompany(event.target.value as string);
  };

  const handleClose = () => {
    submitCompany();
    setOpen(false);
  };

  useEffect(() => {
    async function getCompanies() {
      const result = await functions.httpsCallable("getCompanies")();
      setCompanies(result.data);
    }
    getCompanies();
  }, []);

  function submitCompany() {
    functions.httpsCallable("setUserDetails")(company);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="form-dialog-title">Select your Company</DialogTitle>
      <DialogContent>
        <FormControl id="company-select" variant="outlined">
          <InputLabel>Company</InputLabel>
          <Select
            value={company}
            onChange={handleChangeSelectCompany}
            label="Company"
          >
            {companies.map((company) => (
              <MenuItem value={company["name"]}>{company["name"]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompanyForm;
