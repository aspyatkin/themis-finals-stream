module.exports = function matchNetworks (netAddrList, addr) {
  for (const netAddr of netAddrList) {
    if (netAddr.contains(addr)) {
      return netAddr
    }
  }

  return null
}
