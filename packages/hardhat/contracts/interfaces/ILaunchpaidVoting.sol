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

enum ProposalType {
  SetMinClosingFee,
  SetMaxClosingFee
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
  address[] voters;
  mapping(address => ProposalVoteValue) votes;
}

interface LaunchpaidVoting {
  event Proposal(uint48 indexed id, address indexed creator);
  event Vote(address indexed wallet, bool value);
  event Ended(uint48 indexed id, bool indexed passed);

  function hasVoted(uint48 id, address wallet) external view returns (bool);
  function tokensRequiredToVote() external view returns (uint256);
  function canVote(uint48 id, address wallet) external view returns (bool);
  function vote(uint48 id, bool value) external;
  function proposal(ProposalType proposalType, uint256 proposedValue, string memory description) external;
  function getProposal(uint48 id) external view returns (
    ProposalType proposalType,
    string memory description,
    uint48 createdAt,
    uint48 numVotes,
    bool isOver,
    bool success
  );
  function numProposals() external view returns (uint48);
  function activateProposal(uint48 id) external;
}
