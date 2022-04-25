//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract CleverToken is ERC20 {
    IUniswapV3Pool _pool;
    mapping(address => TimeLimit) private _timeLimits;
    mapping(address => PriceLimit) private _priceLimits;

    constructor(
        address weth,
        address alice,
        address bob
    ) ERC20("CleverToken", "CT") {
        _pool = createPool(weth);
        _mint(address(this), 30);

        _mint(alice, 10);
        _timeLimits[alice] = TimeLimit(block.timestamp + 365 days, 10);
        _priceLimits[alice] = PriceLimit(2000000000000000, 10);

        _mint(bob, 5);
        _timeLimits[bob] = TimeLimit(block.timestamp + 8 weeks, 5);
        _priceLimits[bob] = PriceLimit(1500000000000000, 5);
    }

    function unlock() public {
        uint256 amountToSend;

        TimeLimit memory timeLimit = _timeLimits[msg.sender];
        if (timeLimit.since > 0 && timeLimit.since <= block.timestamp) {
            amountToSend += timeLimit.amount;
            delete _timeLimits[msg.sender];
        }

        (uint256 price, , , , , , ) = _pool.slot0();
        PriceLimit memory priceLimit = _priceLimits[msg.sender];
        if (priceLimit.price > 0 && priceLimit.price <= price) {
            amountToSend += priceLimit.amount;
            delete _priceLimits[msg.sender];
        }

        if (amountToSend > 0) {
            _transfer(address(this), msg.sender, amountToSend);
        }
    }

    function createPool(address weth)
        internal
        virtual
        returns (IUniswapV3Pool)
    {
        return
            IUniswapV3Pool(
                IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984)
                    .createPool(address(this), weth, 0)
            );
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
