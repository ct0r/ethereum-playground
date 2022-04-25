//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../CleverToken.sol";

contract CleverTokenMock is CleverToken {
    uint160 _sqrtPriceX96;

    constructor(
        address weth,
        address alice,
        address bob
    ) CleverToken(weth, alice, bob) {}

    function initialize(uint160 sqrtPriceX96) external {
        _sqrtPriceX96 = sqrtPriceX96;
    }

    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        return (_sqrtPriceX96, 0, 0, 0, 0, 0, true);
    }

    function createPool(address weth)
        internal
        view
        override
        returns (IUniswapV3Pool)
    {
        return IUniswapV3Pool(address(this));
    }
}
