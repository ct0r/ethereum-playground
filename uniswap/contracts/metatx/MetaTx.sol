//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MetaTx is ERC20 {
    constructor() ERC20("meta tx", "mtx") {}

    function metaMint(
        address to,
        uint256 amount,
        bytes calldata signature
    ) public {
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(to, amount))
            )
        );

        require(to == _recover(hash, signature), "You shall not mint!");

        _mint(to, amount);
    }

    function _recover(bytes32 hash, bytes memory signature)
        private
        pure
        returns (address)
    {
        require(signature.length == 65);

        uint8 v;
        bytes32 r;
        bytes32 s;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(hash, v, r, s);
    }
}
