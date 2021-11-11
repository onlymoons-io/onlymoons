// SPDX-License-Identifier: UNLICENSED

/**
  ____/\__    __ __        .__   __  .__                               ____/\__
 /   / /_/   /  Y  \  __ __|  |_/  |_|__|__________    ______ ______  /   / /_/
 \__/ / \   /  \ /  \|  |  \  |\   __\  \____ \__  \  /  ___//  ___/  \__/ / \ 
 / / /   \ /    Y    \  |  /  |_|  | |  |  |_> > __ \_\___ \ \___ \   / / /   \
/_/ /__  / \____|__  /____/|____/__| |__|   __(____  /____  >____  > /_/ /__  /
  \/   \/          \/                   |__|       \/     \/     \/    \/   \/ 

  https://multipass.tools
*/

pragma solidity ^0.8.0;

import { IERC20 } from "./library/IERC20.sol";

enum ProposalType {
  SetGovernanceToken,
  SetLockerFee,
  SetMinClosingFee,
  SetMaxClosingFee,
  SetSoftCap,
  SetHardCap
}

struct ProposalVoteValue {
  bool voted;
  bool vote;
}

struct ProposalStruct {
  ProposalType proposalType;
  uint256 proposedValue;
  string description;
  uint48 createdAt;
  bool activated;
  address governor;
  address[] voters;
  mapping(address => ProposalVoteValue) votes;
}

abstract contract Governable {
  event ProposalCreated(uint40 indexed id, address indexed creator);
  event ProposalVoted(uint40 indexed id, address indexed wallet, bool value);
  event ProposalEnded(uint40 indexed id, bool indexed passed);
  event ProposalActivated(uint40 indexed id);

  constructor(address governanceTokenAddress) {
    _governanceToken = IERC20(governanceTokenAddress);
  }

  IERC20 internal _governanceToken;

  uint40 internal _numProposals = 0;

  mapping(uint40 => ProposalStruct) internal _proposals;

  modifier onlyCanVote(uint40 id) {
    require(canVote(id, msg.sender), "Not allowed to vote");
    _;
  }
  
  modifier onlyCanGovern(uint40 id) {
    require(true, "Not allowed to govern");
    _;
  }

  function hasVoted(uint40 id, address wallet) public view returns (bool) {
    return _proposals[id].votes[wallet].voted;
  }

  function tokensRequiredToVote() public view returns (uint256) {
    // TODO - calculate an amount in usd, like 50 dollars
    return 1000 * (10 ** _governanceToken.decimals());
  }

  function canVote(uint40 id, address wallet) public view returns (bool) {
    return !hasVoted(id, wallet) && _governanceToken.balanceOf(wallet) >= tokensRequiredToVote();
  }

  function vote(uint40 id, bool value) onlyCanVote(id) public {
    _proposals[id].votes[msg.sender].vote = value;
    _proposals[id].votes[msg.sender].voted = true;

    emit ProposalVoted(id, msg.sender, value);
  }

  function proposal(ProposalType proposalType, uint256 proposedValue, string memory description) public {
    uint40 id = _numProposals++;

    _proposals[id].proposalType = proposalType;
    _proposals[id].proposedValue = proposedValue;
    _proposals[id].description = description;
    _proposals[id].createdAt = uint48(block.timestamp);
    _proposals[id].activated = false;
    // make sure the voters array is empty. this shouldn't even be necessary.
    // delete _proposals[id].voters;

    emit ProposalCreated(id, msg.sender);
  }

  function _getProposalIsOver(uint40 id) internal view returns (bool) {
    return false;
  }

  function _getProposalSuccess(uint40 id) internal view returns (bool) {
    return false;
  }

  function getProposal(uint40 id) public view returns (
    ProposalType proposalType,
    uint256 proposedValue,
    string memory description,
    uint48 createdAt,
    uint40 numVotes,
    bool isOver,
    bool success
  ){
    proposalType = _proposals[id].proposalType;
    proposedValue = _proposals[id].proposedValue;
    description = _proposals[id].description;
    createdAt = _proposals[id].createdAt;
    numVotes = uint40(_proposals[id].voters.length);
    isOver = _getProposalIsOver(id);
    success = _getProposalSuccess(id);
  }

  function numProposals() public view returns (uint40) {
    return _numProposals;
  }

  function activateProposal(uint40 id) public {
    require(_getProposalIsOver(id), "Voting isn't over yet");
    require(_getProposalSuccess(id), "Proposal failed");
    require(!_proposals[id].activated, "Already activated");

    _proposals[id].governor = msg.sender;

    ProposalType t = _proposals[id].proposalType;
    uint256 val256 = _proposals[id].proposedValue;

    // check for proposal presets that we can handle in the parent contract
    if (t == ProposalType.SetGovernanceToken) {
      _setGovernanceToken(id, address(uint160(val256)));
    }

    // proposal handler that can be overridden
    _activatingProposal(id);

    // mark that it was activated so this never runs again
    _proposals[id].activated = true;

    // why don't you emit an event about it
    emit ProposalActivated(id);
  }

  /**
   * @dev override this in a child contract to add governance behaviours
   */
  function _activatingProposal(uint40 id) internal virtual {
    //
  }

  /**
   * @dev governance functions all take the proposal id as their first argument
   */
  function _setGovernanceToken(uint40 id, address governanceTokenAddress) onlyCanGovern(id) private {
    _governanceToken = IERC20(governanceTokenAddress);
  }
}
