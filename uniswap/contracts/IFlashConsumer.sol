//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IFlashConsumer {
    function onFlash(bytes calldata data) external;
}
