import React, { useState } from "react";
import { EHR } from "./abi/abi";
import Web3 from "web3";
import "./App.css";

// Access our wallet inside of our dapp
const web3 = new Web3(Web3.givenProvider);
// Contract address of the deployed smart contract
const contractAddress = "0x91430Ed7332b1C46Ad2438cB55be8B3f179fBdfa";
const ehrContract = new web3.eth.Contract(EHR, contractAddress);

function App() {
  // Hold variables that will interact with our contract and frontend
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState(0);
  const [patientGender, setPatientGender] = useState("");
  const [patientBloodType, setPatientBloodType] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [patientCount, setPatientCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [ehrContract, setEHRContract] = useState(null);
  const [reportId, setReportId] = useState(1);
  const [report, setReport] = useState({});
  
  const loadEHRContract = async () => {
    // load EHR contract here
    const ehrContract = new web3.eth.Contract(EHR, contractAddress);
    setEHRContract(ehrContract);

    // get patient and report counts
    const countPatient = await ehrContract.methods.patientCount().call();
    setPatientCount(countPatient);
    
    const countReport = await ehrContract.methods.reportCount().call();
    setReportCount(countReport);
  };

  const handleGetReport = async () => {
    try {
      // Get report information from contract
      const reportInfo = await ehrContract.methods.getReportById(reportId).call();

      // Set report state
      setReport({
        patientName: reportInfo[0],
        doctorName: reportInfo[1],
        reportType: reportInfo[2],
        description: reportInfo[3],
        date: reportInfo[4],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addPatient = async (event) => {
    event.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const gas = await ehrContract.methods.addPatient(patientName, patientAge, patientGender, patientBloodType).estimateGas();
    const result = await ehrContract.methods.addPatient(patientName, patientAge, patientGender, patientBloodType).send({ from: account, gas });
    console.log(result);
  };

  const addReport = async (event) => {
    event.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const gas = await ehrContract.methods.addReport(patientName, account, reportType, reportDescription, new Date().toLocaleString()).estimateGas();
    const result = await ehrContract.methods.addReport(patientName, account, reportType, reportDescription, new Date().toLocaleString()).send({ from: account, gas });
    console.log(result);
  };


  return (
    <div className="App">
    <h1 className="header">EHR DApp</h1>
    <p>Patient Count: {patientCount}</p>
    <p>Report Count: {reportCount}</p>
    <form onSubmit={addPatient}>
      <h2 className="subheader">Add Patient</h2>
      <label>
        Name:
        <input className="inputField" type="text" value={patientName} onChange={(event) => setPatientName(event.target.value)} />
      </label>
      <br />
      <label>
        Age:
        <input className="inputField" type="number" value={patientAge} onChange={(event) => setPatientAge(event.target.value)} />
      </label>
      <br />
      <label>
        Gender:
        <input className="inputField" type="text" value={patientGender} onChange={(event) => setPatientGender(event.target.value)} />
      </label>
      <br />
      <label>
        Blood Type:
        <input className="inputField" type="text" value={patientBloodType} onChange={(event) => setPatientBloodType(event.target.value)} />
      </label>
      <br />
      <button className="button" type="submit">Add Patient</button>
    </form>
    <form onSubmit={addReport}>
      <h2 className="subheader">Add Report</h2>
      <label>
        Patient Name:
        <input className="inputField" type="text" value={patientName} onChange={(event) => setPatientName(event.target.value)} />
      </label>
      <br />
      <label>
        Report Type:
        <input className="inputField" type="text" value={reportType} onChange={(event) => setReportType(event.target.value)} />
      </label>
      <br />
      <label>
        Description:
        <input className="inputField" type="text" value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} />
      </label>
      <br />
      <button className="button" type="submit">Add Report</button>
    </form>

    <div className="container">
      <div className="form-container">
        <label htmlFor="reportId">Enter Report ID:</label>
        <input
          type="number"
          id="reportId"
          name="reportId"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
        />
        <button onClick={handleGetReport}>Get Report</button>
      </div>
      <div className="report-container">
        <h2>Report Information:</h2>
        <p>Patient Name: {report.patientName}</p>
        <p>Doctor Name: {report.doctorName}</p>
        <p>Report Type: {report.reportType}</p>
        <p>Description: {report.description}</p>
        <p>Date: {report.date}</p>
      </div>
    </div>
  </div>
  );
}

export default App;