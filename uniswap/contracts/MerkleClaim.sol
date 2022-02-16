//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MerkleClaim is ERC20 {
    bytes32 private root;

    constructor(bytes32 _root) ERC20("Claimable Token", "CT") {
        root = _root;
    }

    function claim(bytes32[] calldata _proof) public {
        bytes32 hash = keccak256(abi.encode(msg.sender));
        for (uint256 i = 0; i < _proof.length; i++) {
            hash = keccak256(abi.encodePacked(hash, _proof[i]));
        }

        require(root == hash);

        _mint(msg.sender, 1000);
    }
}
