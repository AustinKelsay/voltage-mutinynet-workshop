import React, { useState } from "react";
import axios from "axios";

function LightningWallet({ host, port, macaroon, lightningBalance }) {
  const [receiveShowing, setReceiveShowing] = useState(false);
  const [sendShowing, setSendShowing] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [amount, setAmount] = useState("");

  const createInvoice = async () => {
    try {
      const options = {
        method: "POST",
        url: `${host}:${port}/v1/invoices`,
        data: {
          value: amount,
        },
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      alert(`Invoice created successfully\n\n${response.data.payment_request}`);
      setReceiveShowing(false);
      setAmount("");
    } catch (error) {
      alert(
        `Failed to create invoice: ${JSON.stringify(error.response?.data)}`,
      );
    }
  };

  const payInvoice = async () => {
    try {
      const options = {
        method: "POST",
        url: `${host}:${port}/v1/channels/transactions`,
        data: {
          payment_request: invoice,
        },
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      alert(
        `Invoice paid successfully\n\npayment preimage: ${response.data.payment_preimage}`,
      );
      setSendShowing(false);
      setInvoice("");
    } catch (error) {
      alert(`Failed to pay invoice: ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <div className="lightning-wallet">
      <div className="balance">
        <h3>Lightning balance</h3>
        <p>{lightningBalance} sats</p>
      </div>

      <div className="wallet-actions">
        <button onClick={() => setReceiveShowing(!receiveShowing)}>
          Receive
        </button>
        <button onClick={() => setSendShowing(!sendShowing)}>Send</button>
      </div>

      {receiveShowing && (
        <div className="invoice-form">
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={createInvoice}>Create Invoice</button>
        </div>
      )}

      {sendShowing && (
        <div className="invoice-form">
          <input
            type="text"
            placeholder="Invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
          <button onClick={payInvoice}>Pay Invoice</button>
        </div>
      )}
    </div>
  );
}

export default LightningWallet;
