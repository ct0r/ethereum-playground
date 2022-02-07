//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPool {
    function aToken() external view returns (IERC20);

    function bToken() external view returns (IERC20);

    function aBalance() external view returns (uint256);

    function bBalance() external view returns (uint256);

    function price() external view returns (uint256);

    function deposit(uint256 aAmount, uint256 bAmount) external;

    function withdraw(uint256 aAmount, uint256 bAmount) external;

    function buy(uint256 aAmountToBuy) external;

    function sell(uint256 aAmountToSell) external;

    function flash(
        address recipient,
        uint256 aAmount,
        uint256 bAmount,
        bytes calldata data
    ) external;
}
