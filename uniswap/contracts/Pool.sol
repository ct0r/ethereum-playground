//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pool is ERC20 {
    IERC20 public aToken;
    IERC20 public bToken;

    constructor(address aTokenAddr, address bTokenAddr)
        ERC20("LP Token", "LP")
    {
        aToken = IERC20(aTokenAddr);
        bToken = IERC20(bTokenAddr);
    }

    function deposit(uint256 aAmount, uint256 bAmount) public {
        require(
            (aBalance() == 0 && bBalance() == 0) || aAmount / bAmount == price()
        );

        address addr = address(this);

        aToken.transferFrom(msg.sender, addr, aAmount);
        bToken.transferFrom(msg.sender, addr, bAmount);

        _mint(msg.sender, aAmount * bAmount);
    }

    function withdraw(uint256 aAmount, uint256 bAmount) public {
        require(aAmount / bAmount == price());

        aToken.transfer(msg.sender, aAmount);
        bToken.transfer(msg.sender, bAmount);

        _burn(msg.sender, aAmount * bAmount);
    }

    function aBalance() public view returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function bBalance() public view returns (uint256) {
        return bToken.balanceOf(address(this));
    }

    function price() public view returns (uint256) {
        return aBalance() / bBalance();
    }
}
