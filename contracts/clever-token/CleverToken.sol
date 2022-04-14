//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CleverToken is ERC20 {
    mapping(address => TimeLimit) private _timeLimits;
    mapping(address => PriceLimit) private _priceLimits;

    constructor(address aliceAddr, address bobAddr) ERC20("CleverToken", "CT") {
        _mint(address(this), 30);

        // Alice.
        _mint(aliceAddr, 10);
        _timeLimits[aliceAddr] = TimeLimit(block.timestamp + 365 days, 10);
        _priceLimits[aliceAddr] = PriceLimit(2000000000000000, 10);

        // Bob.
        _mint(bobAddr, 5);
        _timeLimits[bobAddr] = TimeLimit(block.timestamp + 8 weeks, 5);
        _priceLimits[bobAddr] = PriceLimit(1500000000000000, 5);
    }

    function unlock() public {
        uint256 amountToSend;

        TimeLimit memory timeLimit = _timeLimits[msg.sender];
        if (timeLimit.since > 0 && timeLimit.since <= block.timestamp) {
            amountToSend += timeLimit.amount;
            delete _timeLimits[msg.sender];
        }

        PriceLimit memory priceLimit = _priceLimits[msg.sender];
        if (priceLimit.price > 0 && priceLimit.price <= 10) {
            amountToSend += priceLimit.amount;
            delete _priceLimits[msg.sender];
        }

        if (amountToSend > 0) {
            _transfer(address(this), msg.sender, amountToSend);
        }
    }
}

struct TimeLimit {
    uint256 since;
    uint256 amount;
}

struct PriceLimit {
    uint256 price;
    uint256 amount;
}
