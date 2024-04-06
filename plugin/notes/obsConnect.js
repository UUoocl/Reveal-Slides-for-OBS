async function connectOBS(obs) {
   const websocketIP = wssDetails.IP
    const websocketPort = wssDetails.PORT
    websocketPassword = wssDetails.PW

  //connect to OBS web socket server
  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obs.connect(`ws://${websocketIP}:${websocketPort}`, websocketPassword, {
      rpcVersion: 1
    });
    console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
    //document.title = "connection set";
  } catch (error) {
    console.error('Failed to connect', error.code, error.message);
  }
  obs.on('error', err => {
    console.error('Socket error:', err)
  })
  console.log(`ws://${websocketIP}:${websocketPort}`)
  return obs;
}