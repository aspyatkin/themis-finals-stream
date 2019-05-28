module.exports = function matchNetworks (netAddrList, addr) {
  for (let netAddr of netAddrList) {
    if (netAddr.contains(addr)) {
      return netAddr
    }
  }

  return null
}
