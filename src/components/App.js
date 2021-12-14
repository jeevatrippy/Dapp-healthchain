import React, { Component } from 'react';
import './App.css';
import Web3 from "web3";
import { create } from 'ipfs-http-client';
import Meme from '../abis/Meme.json';
const CID = require('cids')

const ipfs= new create({host:'ipfs.infura.io',port:5001,protocol:'https'});

class App extends Component {

    async componentWillMount(){
        await this.loadWeb3()
        await this.loadBlockchainDate()
    }

    async loadBlockchainDate(){
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({account:accounts[0]})
        const networkId = await web3.eth.net.getId()
        const networkData = Meme.networks[networkId]
        if(networkData){
            const abi = Meme.abi
            const address = networkData.address
            const contract = web3.eth.Contract(abi,address)
            this.setState({contract:contract})
            const memeHash = await contract.methods.get().call()
            this.setState({memeHash:memeHash})
        }else{
            window.alert("Smart contract not deployed to the detected network")
        }
    }

    constructor(props) {
        super(props);
        this.state={account:'',buffer:null,contarct:null,memeHash:''};
    }

    async loadWeb3(){
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } if(window.web3){
            window.web3 = new Web3(window.web3.currentProvider)
        }else{
            window.alert('Please use Metamask');
        }
    }

    captureFile = (event) =>{
        event.preventDefault();
        const  file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);

        reader.onloadend = () =>{
            this.setState({buffer:Buffer(reader.result)})
        }
    }


    onSubmit = async (event) =>{
        event.preventDefault();
        console.log('form submitting');
        console.log(this.state.buffer);

        const added = await ipfs.add(this.state.buffer)
        // const val = new CID(added.path).toV1().toString('base32')
        const val = added.path
        const memeHash = val;
            console.log(val);

        this.state.contract.methods.set(memeHash).send({from:this.state.account}).then((r)=>{
            this.setState({memeHash:memeHash})
        })
    }


  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the Day
          </a>
            <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className="text-white">{this.state.account}</small>
                </li>
            </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io:5001/api/v0/cat?arg=${this.state.memeHash}`} className="App-logo"/>
                </a>
                  <p>&nbsp;</p>
                  <h2>Change a Meme</h2>
               <form onSubmit={this.onSubmit}>
                 <input type="file" onChange={this.captureFile}/>
                 <input type="submit"/>
               </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
