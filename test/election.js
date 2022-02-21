var Election = artifacts.require('./contracts/Election.sol')

contract("Election", (accounts)=>{
     var electioninstance
     it("Initializes with 2 accounts",()=>{
          return Election.deployed().then((data)=>{
               return data.countCandidates()
          }).then((count)=>{
               assert.equal(count,2);
          })
     })
     it("Initializes the candidates with correct values",()=>{
          return Election.deployed().then((data)=>{
               electioninstance = data
               return electioninstance.candidates(1)
          }).then((candidate)=>{
               assert.equal(candidate[0],1,"Contains correct Id");
               assert.equal(candidate[1],"Souvik","Contains Correct name")
               assert.equal(candidate[2],0,"Contains 0 votes")
               return electioninstance .candidates(2)
          }).then((candidate)=>{
               assert.equal(candidate[0],2,"Contains correct Id");
               assert.equal(candidate[1],"Sayan","Contains Correct name")
               assert.equal(candidate[2],0,"Contains 0 votes")
          })
     })
     it("allows a voter to cast a vote",()=>{
          return Election.deployed().then((data)=>{
               electioninstance = data
               candidateId = 1
               return electioninstance.vote(candidateId, { from:accounts[0] })
          }).then((receipt)=>{
               return electioninstance.voters(accounts[0])
          }).then((voted)=>{
               assert(voted,"the voter was marked as voted")
               return electioninstance.candidates(candidateId)
          }).then((candidate)=>{
               assert.equal(candidate[2],1,"increments the candidate votecount")
          })
     })

     it("throws an exception for invalid candiates", function() {
          return Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.vote(99, { from: accounts[1] })
          }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
          }).then(function(candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
          }).then(function(candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
          });
     });

     it("throws an exception for double voting", function() {
          return Election.deployed().then(function(instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[1] });
            return electionInstance.candidates(candidateId);
          }).then(function(candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "accepts first vote");
            // Try to vote again
            return electionInstance.vote(candidateId, { from: accounts[1] });
          }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
          }).then(function(candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
          }).then(function(candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
          });
     });
})