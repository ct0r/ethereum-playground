//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract Assembly {
    function hashAddress(address addr) public pure {
        bytes32 expected = keccak256(abi.encode(addr));

        assembly {
            let ptr := mload(64)
            mstore(ptr, addr)

            let actual := keccak256(ptr, 32)

            if iszero(eq(expected, actual)) {
                revert(0, 0)
            }
        }
    }

    function abiEncode(bytes32 a, bytes32 b) public pure {
        bytes32 expected = keccak256(abi.encode(a, b));

        bytes memory buffer = new bytes(64);
        assembly {
            let ptr := add(buffer, 32)
            mstore(ptr, a)
            mstore(add(ptr, 32), b)

            let actual := keccak256(ptr, 64)

            if iszero(eq(expected, actual)) {
                revert(0, 0)
            }
        }
    }

    function returnString() public pure returns (string memory s) {
        string memory q = "Hello";

        assembly {
            mstore(s, mload(q)) // length
            mstore(add(s, 32), mload(add(q, 32))) // content
        }
    }
}
