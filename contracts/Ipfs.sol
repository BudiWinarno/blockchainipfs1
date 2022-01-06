pragma solidity >=0.4.21 <0.7.0;

contract Ipfs {
    string ipfsHash;

    function set(string memory _ipfsHash) public {
        ipfsHash = _ipfsHash;
    }

    function get() public view returns (string memory) {
        return ipfsHash;
    }
}
