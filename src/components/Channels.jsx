import React, { useState } from "react";
import axios from "axios";
import "./components.css";

const Channels = ({ channels, host, port, macaroon, loadChannels }) => {
  const [showOpenChannelForm, setShowOpenChannelForm] = useState(false);
  const [nodePubkey, setNodePubkey] = useState("");
  const [localFundingAmount, setLocalFundingAmount] = useState(0);

  function hexToBase64(hexstring) {
    return window.btoa(
      hexstring
        .match(/\w{2}/g)
        .map(function (a) {
          return String.fromCharCode(parseInt(a, 16));
        })
        .join(""),
    );
  }

  // https://lightning.engineering/api-docs/api/lnd/lightning/open-channel-sync
  const openChannel = async () => {
    try {
      const options = {
        method: "POST",
        url: `${host}:${port}/v1/channels`,
        data: {
          node_pubkey: hexToBase64(nodePubkey),
          local_funding_amount: localFundingAmount,
          private: false,
        },
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      console.log("Open channel response:", response.data);

      if (response.data.funding_txid_bytes) {
        setShowOpenChannelForm(false);
        alert("Channel opening initiated");
        loadChannels();
      }
    } catch (error) {
      alert(`Failed to open channel: ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <div className="channels">
      <h2>Channels</h2>
      <button onClick={() => setShowOpenChannelForm(!showOpenChannelForm)}>
        Open Channel
      </button>

      {/* open channel form */}
      {showOpenChannelForm && (
        <div className="open-channel-form">
          <input
            type="text"
            placeholder="Node Pubkey"
            value={nodePubkey}
            onChange={(e) => setNodePubkey(e.target.value)}
          />
          <input
            type="number"
            placeholder="Local Funding Amount (sats)"
            value={localFundingAmount}
            onChange={(e) => setLocalFundingAmount(e.target.value)}
          />
          <button onClick={openChannel}>Open Channel</button>
        </div>
      )}

      {/* channels table */}
      <table>
        <thead>
          <tr>
            <th>Channel ID</th>
            <th>Local balance</th>
            <th>Remote balance</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((c) => (
            <tr key={c.chan_id}>
              <td>{c.chan_id}</td>
              <td>{c.local_balance}</td>
              <td>{c.remote_balance}</td>
              <td>{c.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Channels;
