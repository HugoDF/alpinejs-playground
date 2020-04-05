function getCommit() {
  console.log('runs');
  return process.env.REPOSITORY_URL && process.env.COMMIT_REF
    ? {
        url: `${process.env.REPOSITORY_URL}/commits/${process.env.COMMIT_REF}`,
        text: process.env.COMMIT_REF.slice(0, 6)
      }
    : {
        url: "",
        text: "develop"
      };
}

module.exports = getCommit();
