//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IFlashConsumer.sol";
import "./IPool.sol";

contract Pool is ERC20, IPool {
    IERC20 public override aToken;
    IERC20 public override bToken;

    constructor(address aTokenAddr, address bTokenAddr)
        ERC20("LP Token", "LP")
    {
        aToken = IERC20(aTokenAddr);
        bToken = IERC20(bTokenAddr);
    }

    function aBalance() public view override returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function bBalance() public view override returns (uint256) {
        return bToken.balanceOf(address(this));
    }

    function price() public view override returns (uint256) {
        return aBalance() / bBalance();
    }

    function deposit(uint256 aAmount, uint256 bAmount) public override {
        require(
            (aBalance() == 0 && bBalance() == 0) || aAmount / bAmount == price()
        );

        address addr = address(this);

        aToken.transferFrom(msg.sender, addr, aAmount);
        bToken.transferFrom(msg.sender, addr, bAmount);

        _mint(msg.sender, aAmount * bAmount);
    }

    function withdraw(uint256 aAmount, uint256 bAmount) public override {
        require(aAmount / bAmount == price());

        aToken.transfer(msg.sender, aAmount);
        bToken.transfer(msg.sender, bAmount);

        _burn(msg.sender, aAmount * bAmount);
    }

    function buy(uint256 aAmountToBuy) public override {
        uint256 bAmountToSell = aAmountToBuy * price();

        aToken.transferFrom(msg.sender, address(this), aAmountToBuy);
        bToken.transfer(msg.sender, bAmountToSell);
    }

    function sell(uint256 aAmountToSell) public override {
        uint256 bAmountToBuy = aAmountToSell / price();

        aToken.transferFrom(msg.sender, address(this), aAmountToSell);
        bToken.transfer(msg.sender, bAmountToBuy);
    }

    function flash(
        address recipient,
        uint256 aAmount,
        uint256 bAmount,
        bytes calldata data
    ) public override {
        aToken.transfer(recipient, aAmount);
        bToken.transfer(recipient, bAmount);

        IFlashConsumer consumer = IFlashConsumer(recipient);
        consumer.onFlash(data);

        aToken.transferFrom(recipient, address(this), aAmount);
        bToken.transferFrom(recipient, address(this), bAmount);
    }
}
