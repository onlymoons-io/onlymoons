// SPDX-License-Identifier: UNLICENSED

/**
  ____/\__    __ __        .__   __  .__                               ____/\__
 /   / /_/   /  Y  \  __ __|  |_/  |_|__|__________    ______ ______  /   / /_/
 \__/ / \   /  \ /  \|  |  \  |\   __\  \____ \__  \  /  ___//  ___/  \__/ / \ 
 / / /   \ /    Y    \  |  /  |_|  | |  |  |_> > __ \_\___ \ \___ \   / / /   \
/_/ /__  / \____|__  /____/|____/__| |__|   __(____  /____  >____  > /_/ /__  /
  \/   \/          \/                   |__|       \/     \/     \/    \/   \/ 

  https://multipass.tools

  token features:

  - automatically ban frontrun bots
      if a frontrun bot is detected, the address is flagged and the transfer is reverted.
      after [x] warnings the wallet will be banned from further transfers.
      in the case of an accidental ban, please contact us and we can unban you.
*/

pragma solidity ^0.8.0;

import { IERC20 } from "./library/IERC20.sol";
import { Ownable } from "./Ownable.sol";
import { AntiBot } from "./AntiBot.sol";

contract Launchpaid is IERC20, Ownable, AntiBot {
  constructor(
    string memory __name,
    string memory __symbol,
    uint8 __decimals,
    uint256 __totalSupply
  ) Ownable() AntiBot() {
    // setup the token with constructor args
    _name = __name;
    _symbol = __symbol;
    _decimals = __decimals;
    _totalSupply = __totalSupply * (10 ** __decimals);
    
    // give entire supply to creator
    _balances[msg.sender] = _totalSupply;
    emit Transfer(address(0), msg.sender, _totalSupply);
  }

  uint8 private _decimals;
  string private _name;
  string private _symbol;

  /**
   * 
   */
  uint256 private _totalSupply;

  mapping(address => uint256) private _balances;
  mapping(address => mapping(address => uint256)) private _allowances;

  function name() public view override returns (string memory) {
    return _name;
  }

  function symbol() public view override returns (string memory) {
    return _symbol;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view override returns (uint256) {
    return _balances[account];
  }

  // give the owner access to setting the name and symbol,
  // just in case we ever need to change it.
  function setName(string memory value) onlyOwner() external {
    _name = value;
  }
  function setSymbol(string memory value) onlyOwner() external {
    _symbol = value;
  }

  function _transfer(address from, address to, uint256 amount) private {
    require(!isBanned(from), "From address is banned");
    require(!isBanned(to), "To address is banned");
    require(from != address(0), "Cannot transfer from the zero address");
    require(to != address(0), "Cannot transfer to the zero address");
    // NOTE - the built in overflow check in solidity 0.8 should throw
    // when amount exceeds balance, so we shouldn't need to check this manually.
    // require(_balances[from] >= amount, "Transfer amount exceeds sender balance");

    // this anti bot check will return true if a bot is detected,
    // and ban if a bot is warned `_numWarningsToBan` times.
    require(!isBotDetected(from, to), "Frontrun bot detected!");

    _balances[from] -= amount;
    _balances[to] += amount;

    emit Transfer(from, to, amount);
  }

  function transfer(address recipient, uint256 amount) public override returns (bool) {
    _transfer(msg.sender, recipient, amount);
    return true;
  }

  function allowance(address owner, address spender) public view override returns (uint256) {
    return _allowances[owner][spender];
  }

  function _approve(address owner, address spender, uint256 amount) private {
    require(owner != address(0), "Cannot approve from the zero address");
    require(spender != address(0), "Cannot approve to the zero address");

    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  function approve(address spender, uint256 amount) public override returns (bool) {
    _approve(msg.sender, spender, amount);
    return true;
  }

  function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
    require(_allowances[sender][msg.sender] >= amount, "Transfer amount exceeds allowance");

    _transfer(sender, recipient, amount);
    _approve(
      sender,
      msg.sender,
      _allowances[sender][msg.sender] - amount
    );
    return true;
  }
}
