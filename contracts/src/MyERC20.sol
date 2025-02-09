pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address holder,
        uint256 supply
    ) ERC20(name, symbol) {
        _mint(holder, supply);
    }
}