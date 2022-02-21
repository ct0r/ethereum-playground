//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssemblyMerkle {
    bytes32 root;

    constructor(bytes32 _root) {
        root = _root;
    }

    function containsSender(bytes32[] calldata _proof) public view {
        address addr = msg.sender;

        bytes32 expected = keccak256(abi.encode(addr));
        for (uint256 i = 0; i < _proof.length; i++) {
            expected = keccak256(abi.encode(expected, _proof[i]));
        }

        assembly {
            let hashPtr := mload(64)
            let bufferPtr := add(hashPtr, 32)

            mstore(hashPtr, addr)
            mstore(hashPtr, keccak256(hashPtr, 32))

            let proofPtr := 36
            let proofLen := calldataload(proofPtr)
            let proofStart := add(proofPtr, 32)
            let proofEnd := add(proofStart, mul(proofLen, 32))
            for {
                let offset := proofStart
            } lt(offset, proofEnd) {
                offset := add(offset, 32)
            } {
                mstore(bufferPtr, calldataload(offset))
                mstore(hashPtr, keccak256(hashPtr, 64))
            }

            if iszero(eq(sload(0), mload(hashPtr))) {
                revert(0, 0)
            }
        }
    }
}
