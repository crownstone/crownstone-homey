import {generateProjectLogger} from "../src";


beforeEach(async () => { })
beforeAll(async () => {

})
afterAll(async () => {

})

test("logging types", async () => {
  let projectName = "testing"
  let Logger = generateProjectLogger(projectName)

  let log = Logger("test")
  let log2 = Logger("test2")
  log.config.setLevel("warn")

  log.none("none");
  log.critical("critical");
  log.error("error");
  log.warn("warn");
  log.notice("notice");
  log.info("info");
  log.debug("debug");
  log.verbose("verbose");
  log.silly("silly");

  log.config.setLevel("debug")
  log.config.setFileLogging(false)
  log.config.setFileLogging(true)

  log2.none("none");
  log2.critical("critical");
  log2.error("error");
  log2.warn("warn");
  log2.notice("notice");
  log2.info("info");
  log2.debug("debug");
  log2.verbose("verbose");
  log2.silly("silly");

  let ids = log.config.getLoggerIds()

  expect(ids).toStrictEqual([projectName])
  log.config.getTransportForLogger(ids[0])
})








