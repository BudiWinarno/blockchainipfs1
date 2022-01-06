import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Ipfs from "./contracts/Ipfs.json";
import { Navbar,Container} from 'react-bootstrap';

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Ipfs.networks[networkId];
    if (networkData) {
      const contract = new web3.eth.Contract(Ipfs.abi, networkData.address);
      this.setState({ contract });
      const ipfsHash = await contract.methods.get().call();
      this.setState({ ipfsHash });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      ipfsHash: "",
      contract: null,
      web3: null,
      buffer: null,
      account: null,
    };
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  onSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting file to ipfs...");
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("Ipfs result", result);
      if (error) {
        console.error(error);
        return;
      }
      this.state.contract.methods
        .set(result[0].hash)
        .send({ from: this.state.account })
        .then((r) => {
          return this.setState({ ipfsHash: result[0].hash });
        });
    });
  };

  render() {
    return (
      <div>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">DAPP ETHEREUM IPFS</Navbar.Brand>
          </Container>
        </Navbar>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <h2>Sistem Aplikasi Pembuatan Identitas Barang</h2>
                  <h2>Menggunakan Secure QR Code Berbasis Blockchain</h2>
              
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.ipfsHash}`} alt="my app"/>
                
                <p>&nbsp;</p>
                <h2>Input QR Code</h2>
                <form onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile} />
                  <input type="submit" />
                </form>
                <p className="mt-4">No. Identitas (CID IPFS) : {this.state.ipfsHash}</p>

                <p>Created by : Budi Winarno</p>
                <h5>Metamask Account Address : {this.state.account}</h5>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;