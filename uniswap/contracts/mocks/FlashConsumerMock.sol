//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IFlashConsumer.sol";
import "../IPool.sol";

contract FlashConsumerMock is IFlashConsumer {
    IPool public pool;
    bytes public data;
    uint256 public aAmount;
    uint256 public bAmount;

    constructor(address poolAddr) {
        pool = IPool(poolAddr);
    }

    function init(
        uint256 _aAmount,
        uint256 _bAmount,
        bytes calldata _data
    ) public {
        // Ask for loan.
        pool.flash(address(this), _aAmount, _bAmount, _data);
    }

    function onFlash(bytes calldata _data) public override {
        // Loan received.
        data = _data;
        aAmount = pool.aToken().balanceOf(address(this));
        bAmount = pool.bToken().balanceOf(address(this));

        // Allow pool to withdraw its tokens back.
        pool.aToken().approve(msg.sender, aAmount);
        pool.bToken().approve(msg.sender, bAmount);
    }
}
