const readPackage = () => parseVersion(require("./package.json").version)

const parseVersion = (version) => {
  const versionParts = version.split(/[\.]/ig)
  const major = parseInt(versionParts[0])
  const minor = parseInt(versionParts[1])
  const patchParts = versionParts.slice(2).join(".").split(/\-alpha\./ig)
  const patch = parseInt(patchParts[0])
  const alpha = patchParts.length > 1 ? parseInt(patchParts[1]) : null

  const current = `${major}.${minor}.${Math.max(patch, 0)}`

  const alphaIncrement = (!!alpha ? 1 : 0)
  const patchIncrement = (!!alpha ? 0 : 1)

  const release = `${major}.${minor}.${Math.max(patch, 0) + patchIncrement}`
  const newAlpha = `${major}.${minor}.${Math.max(patch, 0) + patchIncrement}-alpha.${Math.max(alpha, 1) + alphaIncrement}`
  return { current, newAlpha, release }
}

const printNextAlphaVersion = () => console.log(readPackage().newAlpha)
const printReleaseVersion = () => console.log(readPackage().release)

module.exports = { parseVersion, readPackage, printNextAlphaVersion, printReleaseVersion }
