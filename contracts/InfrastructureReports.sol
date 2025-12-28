// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InfrastructureReports {
    struct Report {
        address reporter;
        string ipfsHash;
        int256 latitude; // Scaled to avoid decimals, e.g., multiply by 1e6
        int256 longitude;
        uint256 timestamp;
        uint256 upvotes;
        uint256 severity;
        Status status;
        address[] upvoters;
        string repairProof; // IPFS hash of repair proof
    }

    enum Status { Pending, InProgress, Repaired }

    mapping(uint256 => Report) public reports;
    uint256 public reportCount;

    mapping(address => uint256) public credits; // Non-transferable reputation points

    // Events for all state changes
    event ReportCreated(uint256 indexed reportId, address indexed reporter, string ipfsHash);
    event ReportUpvoted(uint256 indexed reportId, address indexed upvoter);
    event RepairStarted(uint256 indexed reportId);
    event RepairCompleted(uint256 indexed reportId, string proof);

    // Create a new report
    function createReport(string memory _ipfsHash, int256 _lat, int256 _lon) external {
        reports[reportCount] = Report({
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            latitude: _lat,
            longitude: _lon,
            timestamp: block.timestamp,
            upvotes: 0,
            severity: 0,
            status: Status.Pending,
            upvoters: new address[](0),
            repairProof: ""
        });
        emit ReportCreated(reportCount, msg.sender, _ipfsHash);
        reportCount++;
    }

    // Upvote a report (each address can upvote once)
    function upvoteReport(uint256 _reportId) external {
        require(_reportId < reportCount, "Report does not exist");
        Report storage report = reports[_reportId];
        require(!hasUpvoted(report.upvoters, msg.sender), "Already upvoted");

        report.upvoters.push(msg.sender);
        report.upvotes++;
        report.severity = calculateSeverity(report.upvotes); // Update severity based on upvotes

        // Issue credits
        credits[msg.sender] += 5; // Upvoter gets 5 credits
        credits[report.reporter] += 10; // Reporter gets 10 credits

        emit ReportUpvoted(_reportId, msg.sender);
    }

    // Check if an address has already upvoted
    function hasUpvoted(address[] memory upvoters, address voter) internal pure returns (bool) {
        for (uint256 i = 0; i < upvoters.length; i++) {
            if (upvoters[i] == voter) return true;
        }
        return false;
    }

    // Simple severity calculation: severity = upvotes * 10
    function calculateSeverity(uint256 upvotes) internal pure returns (uint256) {
        return upvotes * 10;
    }

    // Get report details
    function getReport(uint256 _reportId) external view returns (Report memory) {
        require(_reportId < reportCount, "Report does not exist");
        return reports[_reportId];
    }

    // Get credits for an address
    function getCredits(address _user) external view returns (uint256) {
        return credits[_user];
    }
}