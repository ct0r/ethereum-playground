//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Withdrawable {
    constructor() payable {}

    function withdraw() public payable {
        payable(msg.sender).transfer(address(this).balance);
    }
}
