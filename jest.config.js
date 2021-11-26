module.exports = {
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteNameTemplate: "{filename}",
        ancestorSeparator: " › ",
        outputDirectory: "output/reports/unit",
        outputName: "junit.xml",
      },
    ],
  ],
  coverageReporters: ["text", "cobertura"],
};
